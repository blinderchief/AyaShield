"""ABI database and known contract registry for EVM chains."""

# --- Known ERC-20 / ERC-721 ABIs (human-readable fragments) ---

ERC20_FUNCTIONS = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

ERC721_FUNCTIONS = [
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
]

# --- Function Selector Database ---

FUNCTION_SIGNATURES: dict[str, dict] = {
    "0x095ea7b3": {"name": "approve", "type": "ERC-20", "risk": "medium", "description": "Token spending approval"},
    "0xa9059cbb": {"name": "transfer", "type": "ERC-20", "risk": "low", "description": "Token transfer"},
    "0x23b872dd": {"name": "transferFrom", "type": "ERC-20", "risk": "low", "description": "Token transfer (delegated)"},
    "0xa22cb465": {"name": "setApprovalForAll", "type": "ERC-721", "risk": "high", "description": "NFT collection approval"},
    "0x42842e0e": {"name": "safeTransferFrom", "type": "ERC-721", "risk": "low", "description": "Safe NFT transfer"},
    "0x38ed1739": {"name": "swapExactTokensForTokens", "type": "Uniswap V2", "risk": "low", "description": "DEX swap"},
    "0x7ff36ab5": {"name": "swapExactETHForTokens", "type": "Uniswap V2", "risk": "low", "description": "ETH → token swap"},
    "0x18cbafe5": {"name": "swapExactTokensForETH", "type": "Uniswap V2", "risk": "low", "description": "Token → ETH swap"},
    "0xe8e33700": {"name": "addLiquidity", "type": "Uniswap V2", "risk": "low", "description": "Add LP"},
    "0xf305d719": {"name": "addLiquidityETH", "type": "Uniswap V2", "risk": "low", "description": "Add LP with ETH"},
    "0x414bf389": {"name": "exactInputSingle", "type": "Uniswap V3", "risk": "low", "description": "Single-hop swap"},
    "0xc04b8d59": {"name": "exactInput", "type": "Uniswap V3", "risk": "low", "description": "Multi-hop swap"},
    "0xac9650d8": {"name": "multicall", "type": "Uniswap V3", "risk": "medium", "description": "Batched calls"},
    "0xd0e30db0": {"name": "deposit", "type": "WETH", "risk": "low", "description": "Wrap ETH"},
    "0x2e1a7d4d": {"name": "withdraw", "type": "WETH", "risk": "low", "description": "Unwrap ETH"},
    "0x3593564c": {"name": "execute", "type": "Universal Router", "risk": "medium", "description": "Universal router execution"},
}

# --- Event Signature Database ---

EVENT_SIGNATURES: dict[str, dict] = {
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {"name": "Transfer", "type": "ERC-20/721"},
    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {"name": "Approval", "type": "ERC-20"},
    "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31": {"name": "ApprovalForAll", "type": "ERC-721"},
    "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822": {"name": "Swap", "type": "Uniswap V2"},
    "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67": {"name": "Swap", "type": "Uniswap V3"},
    "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1": {"name": "Sync", "type": "Uniswap V2"},
}

# --- Known Trusted Contracts (Ethereum mainnet) ---

KNOWN_CONTRACTS: dict[str, dict] = {
    # Tokens
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {"name": "USDC", "type": "ERC-20", "trusted": True},
    "0xdac17f958d2ee523a2206206994597c13d831ec7": {"name": "USDT", "type": "ERC-20", "trusted": True},
    "0x6b175474e89094c44da98b954eedeac495271d0f": {"name": "DAI", "type": "ERC-20", "trusted": True},
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {"name": "WETH", "type": "ERC-20", "trusted": True},
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": {"name": "WBTC", "type": "ERC-20", "trusted": True},
    "0x514910771af9ca656af840dff83e8264ecf986ca": {"name": "LINK", "type": "ERC-20", "trusted": True},
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": {"name": "UNI", "type": "ERC-20", "trusted": True},
    # DEX Routers
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": {"name": "Uniswap V2 Router", "type": "DEX", "trusted": True},
    "0xe592427a0aece92de3edee1f18e0157c05861564": {"name": "Uniswap V3 Router", "type": "DEX", "trusted": True},
    "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": {"name": "Uniswap V3 Router 02", "type": "DEX", "trusted": True},
    "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": {"name": "Uniswap Universal Router", "type": "DEX", "trusted": True},
    "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": {"name": "SushiSwap Router", "type": "DEX", "trusted": True},
    "0x1111111254eeb25477b68fb85ed929f73a960582": {"name": "1inch V5 Router", "type": "DEX", "trusted": True},
    # NFT
    "0x00000000000000adc04c56bf30ac9d3c0aaf14dc": {"name": "OpenSea Seaport 1.5", "type": "NFT", "trusted": True},
    # DeFi
    "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": {"name": "Aave V2", "type": "Lending", "trusted": True},
    "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": {"name": "Aave V3", "type": "Lending", "trusted": True},
    "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b": {"name": "Compound Comptroller", "type": "Lending", "trusted": True},
}

MAX_UINT256 = (2**256) - 1
UNLIMITED_THRESHOLD = MAX_UINT256 // 2


def lookup_selector(selector: str) -> dict | None:
    return FUNCTION_SIGNATURES.get(selector.lower()[:10])


def lookup_event(topic0: str) -> dict | None:
    return EVENT_SIGNATURES.get(topic0.lower())


def lookup_contract(address: str) -> dict | None:
    return KNOWN_CONTRACTS.get(address.lower())
