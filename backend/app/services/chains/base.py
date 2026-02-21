from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class TransactionData:
    hash: str | None = None
    from_address: str | None = None
    to: str | None = None
    value: str = "0"
    data: str = "0x"
    gas: int = 0
    gas_price: int = 0
    nonce: int = 0
    block_number: int | None = None
    status: int | None = None  # 1=success, 0=fail


@dataclass
class SimulationResult:
    success: bool
    gas_used: int = 0
    return_data: str = ""
    error: str | None = None


@dataclass
class ContractMetadata:
    address: str
    has_code: bool = False
    balance_wei: int = 0
    tx_count: int = 0
    is_verified: bool = False
    contract_name: str | None = None
    source_code: str | None = None
    age_days: int | None = None
    bytecode: str = ""


class BaseChainProvider(ABC):
    """Abstract interface for chain-specific operations."""

    chain: str

    @abstractmethod
    async def get_transaction(self, tx_hash: str) -> TransactionData | None:
        ...

    @abstractmethod
    async def simulate_transaction(
        self, to: str, data: str, value: str = "0", from_address: str | None = None
    ) -> SimulationResult:
        ...

    @abstractmethod
    async def get_contract_metadata(self, address: str) -> ContractMetadata:
        ...

    @abstractmethod
    async def get_receipt(self, tx_hash: str) -> dict | None:
        ...

    @abstractmethod
    async def get_block(self, block_number: int) -> dict | None:
        ...
