import logging

import httpx

from app.config import get_settings
from app.services.chains.base import (
    BaseChainProvider,
    ContractMetadata,
    SimulationResult,
    TransactionData,
)

logger = logging.getLogger(__name__)
settings = get_settings()


class EVMProvider(BaseChainProvider):
    """EVM chain provider using JSON-RPC over httpx for full async support."""

    def __init__(self, chain: str = "ethereum"):
        self.chain = chain
        self._rpc_url = settings.eth_provider_url
        self._etherscan_key = settings.etherscan_api_key

    async def _rpc(self, method: str, params: list | None = None) -> dict:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                self._rpc_url,
                json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params or []},
            )
            resp.raise_for_status()
            body = resp.json()
            if "error" in body:
                raise RuntimeError(body["error"].get("message", "RPC error"))
            return body.get("result")

    async def get_transaction(self, tx_hash: str) -> TransactionData | None:
        raw = await self._rpc("eth_getTransactionByHash", [tx_hash])
        if not raw:
            return None
        return TransactionData(
            hash=raw.get("hash"),
            from_address=raw.get("from"),
            to=raw.get("to"),
            value=str(int(raw.get("value", "0x0"), 16)),
            data=raw.get("input", "0x"),
            gas=int(raw.get("gas", "0x0"), 16),
            gas_price=int(raw.get("gasPrice", "0x0"), 16),
            nonce=int(raw.get("nonce", "0x0"), 16),
            block_number=int(raw["blockNumber"], 16) if raw.get("blockNumber") else None,
        )

    async def simulate_transaction(
        self, to: str, data: str, value: str = "0", from_address: str | None = None
    ) -> SimulationResult:
        call_obj = {"to": to, "data": data}
        if from_address:
            call_obj["from"] = from_address
        if value and value != "0":
            call_obj["value"] = hex(int(value))
        try:
            result = await self._rpc("eth_call", [call_obj, "latest"])
            gas = await self._rpc("eth_estimateGas", [call_obj])
            return SimulationResult(
                success=True, gas_used=int(gas, 16) if gas else 0, return_data=result or ""
            )
        except Exception as e:
            return SimulationResult(success=False, error=str(e))

    async def get_contract_metadata(self, address: str) -> ContractMetadata:
        address = address.lower()
        code, balance, nonce = await self._parallel_metadata(address)

        meta = ContractMetadata(
            address=address,
            has_code=code not in (None, "0x", "0x0"),
            balance_wei=int(balance, 16) if balance else 0,
            tx_count=int(nonce, 16) if nonce else 0,
            bytecode=code or "",
        )

        if self._etherscan_key:
            await self._enrich_from_etherscan(meta)

        return meta

    async def _parallel_metadata(self, address: str) -> tuple:
        async with httpx.AsyncClient(timeout=10) as client:
            rpc_payload = [
                {"jsonrpc": "2.0", "id": 1, "method": "eth_getCode", "params": [address, "latest"]},
                {"jsonrpc": "2.0", "id": 2, "method": "eth_getBalance", "params": [address, "latest"]},
                {"jsonrpc": "2.0", "id": 3, "method": "eth_getTransactionCount", "params": [address, "latest"]},
            ]
            responses = []
            for payload in rpc_payload:
                r = await client.post(self._rpc_url, json=payload)
                responses.append(r.json().get("result"))
            return tuple(responses)

    async def _enrich_from_etherscan(self, meta: ContractMetadata) -> None:
        base = "https://api.etherscan.io/api"
        async with httpx.AsyncClient(timeout=10) as client:
            # Source code verification
            try:
                resp = await client.get(
                    base,
                    params={
                        "module": "contract",
                        "action": "getsourcecode",
                        "address": meta.address,
                        "apikey": self._etherscan_key,
                    },
                )
                data = resp.json()
                if data.get("status") == "1" and data.get("result"):
                    src = data["result"][0]
                    meta.is_verified = src.get("ABI") != "Contract source code not verified"
                    meta.contract_name = src.get("ContractName") or None
                    meta.source_code = src.get("SourceCode") or None
            except Exception:
                logger.debug("Etherscan source code check failed for %s", meta.address)

            # Contract age (first tx)
            try:
                resp = await client.get(
                    base,
                    params={
                        "module": "account",
                        "action": "txlist",
                        "address": meta.address,
                        "startblock": 0,
                        "endblock": 99999999,
                        "page": 1,
                        "offset": 1,
                        "sort": "asc",
                        "apikey": self._etherscan_key,
                    },
                )
                data = resp.json()
                if data.get("status") == "1" and data.get("result"):
                    import time
                    first_ts = int(data["result"][0].get("timeStamp", 0))
                    if first_ts:
                        meta.age_days = int((time.time() - first_ts) / 86400)
            except Exception:
                logger.debug("Etherscan age check failed for %s", meta.address)

    async def get_receipt(self, tx_hash: str) -> dict | None:
        return await self._rpc("eth_getTransactionReceipt", [tx_hash])

    async def get_block(self, block_number: int) -> dict | None:
        hex_block = hex(block_number)
        return await self._rpc("eth_getBlockByNumber", [hex_block, False])

    async def scan_approval_logs(self, wallet_address: str) -> list[dict]:
        """Scan ERC-20 Approval events for a wallet via Etherscan logs API."""
        if not self._etherscan_key:
            return []

        approval_topic = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"
        padded_owner = "0x" + wallet_address.lower().replace("0x", "").zfill(64)
        base = "https://api.etherscan.io/api"

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                base,
                params={
                    "module": "logs",
                    "action": "getLogs",
                    "fromBlock": 0,
                    "toBlock": "latest",
                    "topic0": approval_topic,
                    "topic1": padded_owner,
                    "apikey": self._etherscan_key,
                },
            )
            data = resp.json()
            if data.get("status") != "1":
                return []

            seen = set()
            approvals = []
            for log in data.get("result", []):
                token = log.get("address", "").lower()
                spender = "0x" + log["topics"][2][-40:] if len(log.get("topics", [])) > 2 else ""
                key = f"{token}:{spender}"
                if key in seen:
                    continue
                seen.add(key)

                amount_hex = log.get("data", "0x0")
                try:
                    amount = int(amount_hex, 16)
                except (ValueError, TypeError):
                    amount = 0
                if amount == 0:
                    continue  # Already revoked

                is_unlimited = amount > (2**255)
                approvals.append({
                    "token_address": token,
                    "spender": spender,
                    "amount": str(amount),
                    "is_unlimited": is_unlimited,
                })
            return approvals
