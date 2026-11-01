// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Stocklet
 * @notice Lightweight Web3 inventory management contract for small businesses.
 * Tagline: Know what you have. Track what you sell.
 * Note: All inventory and sales data stored on-chain are publicly verifiable.
 */
contract Stocklet {
    struct Product {
        uint256 id;
        string name;
        uint256 quantity;
        uint256 price;
        address owner;
        uint256 createdAt;
        bool isActive;
        uint256 totalSold;
    }

    uint256 private _nextProductId;
    mapping(uint256 => Product) public products;
    mapping(address => uint256[]) private _ownerProductIds;
    mapping(address => uint256) public ownerSalesCount;

    // Events
    event ProductAdded(
        uint256 indexed productId,
        address indexed owner,
        string name,
        uint256 quantity,
        uint256 price,
        uint256 createdAt
    );

    event ProductUpdated(
        uint256 indexed productId,
        address indexed owner,
        string name,
        uint256 quantity,
        uint256 price,
        uint256 updatedAt
    );

    event SaleRecorded(
        uint256 indexed productId,
        address indexed owner,
        uint256 quantitySold,
        uint256 remainingQuantity,
        uint256 soldAt
    );

    event ProductDeleted(
        uint256 indexed productId,
        address indexed owner,
        uint256 deletedAt
    );

    // Modifiers
    modifier onlyProductOwner(uint256 productId) {
        require(products[productId].owner == msg.sender, "Stocklet: caller is not product owner");
        _;
    }

    modifier productMustExistAndBeActive(uint256 productId) {
        require(products[productId].id != 0, "Stocklet: product does not exist");
        require(products[productId].isActive, "Stocklet: product is inactive or deleted");
        _;
    }

    /**
     * @notice Add a new product to your inventory.
     * @param name Name of the product
     * @param quantity Initial available quantity
     * @param price Unit price
     * @return productId The unique identifier of the created product
     */
    function addProduct(
        string calldata name,
        uint256 quantity,
        uint256 price
    ) external returns (uint256 productId) {
        require(bytes(name).length > 0, "Stocklet: product name cannot be empty");
        require(bytes(name).length <= 100, "Stocklet: product name too long");

        _nextProductId++;
        productId = _nextProductId;

        products[productId] = Product({
            id: productId,
            name: name,
            quantity: quantity,
            price: price,
            owner: msg.sender,
            createdAt: block.timestamp,
            isActive: true,
            totalSold: 0
        });

        _ownerProductIds[msg.sender].push(productId);

        emit ProductAdded(
            productId,
            msg.sender,
            name,
            quantity,
            price,
            block.timestamp
        );
    }

    /**
     * @notice Update an existing product's details.
     * @param productId Unique product identifier
     * @param name Updated product name
     * @param quantity Updated available quantity
     * @param price Updated unit price
     */
    function updateProduct(
        uint256 productId,
        string calldata name,
        uint256 quantity,
        uint256 price
    )
        external
        productMustExistAndBeActive(productId)
        onlyProductOwner(productId)
    {
        require(bytes(name).length > 0, "Stocklet: product name cannot be empty");
        require(bytes(name).length <= 100, "Stocklet: product name too long");

        Product storage product = products[productId];
        product.name = name;
        product.quantity = quantity;
        product.price = price;

        emit ProductUpdated(
            productId,
            msg.sender,
            name,
            quantity,
            price,
            block.timestamp
        );
    }

    /**
     * @notice Record a sale and decrement available stock.
     * @param productId Unique product identifier
     * @param quantitySold Number of units sold
     */
    function recordSale(
        uint256 productId,
        uint256 quantitySold
    )
        external
        productMustExistAndBeActive(productId)
        onlyProductOwner(productId)
    {
        require(quantitySold > 0, "Stocklet: quantity sold must be greater than zero");
        Product storage product = products[productId];
        require(product.quantity >= quantitySold, "Stocklet: sale exceeds available stock");

        product.quantity -= quantitySold;
        product.totalSold += quantitySold;
        ownerSalesCount[msg.sender] += 1;

        emit SaleRecorded(
            productId,
            msg.sender,
            quantitySold,
            product.quantity,
            block.timestamp
        );
    }

    /**
     * @notice Remove a product from active inventory.
     * @param productId Unique product identifier
     */
    function deleteProduct(
        uint256 productId
    )
        external
        productMustExistAndBeActive(productId)
        onlyProductOwner(productId)
    {
        products[productId].isActive = false;

        emit ProductDeleted(
            productId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Retrieve all products belonging to the calling wallet.
     * @return Product array for the calling wallet
     */
    function getMyProducts() external view returns (Product[] memory) {
        uint256[] storage ids = _ownerProductIds[msg.sender];
        uint256 total = ids.length;
        Product[] memory myProducts = new Product[](total);

        for (uint256 i = 0; i < total; i++) {
            myProducts[i] = products[ids[i]];
        }

        return myProducts;
    }

    /**
     * @notice Return the number of products owned by a wallet.
     * @param owner The wallet address to query
     * @return The number of products created by this owner
     */
    function getProductCount(address owner) external view returns (uint256) {
        return _ownerProductIds[owner].length;
    }

    /**
     * @notice Helper to get comprehensive inventory stats for a business owner.
     * @param owner The wallet address to query
     */
    function getOwnerStats(address owner) external view returns (
        uint256 totalActiveProducts,
        uint256 totalStockQuantity,
        uint256 lowStockCount,
        uint256 totalUnitsSold,
        uint256 totalSalesTransactions
    ) {
        uint256[] storage ids = _ownerProductIds[owner];
        uint256 total = ids.length;

        for (uint256 i = 0; i < total; i++) {
            Product storage p = products[ids[i]];
            if (p.isActive) {
                totalActiveProducts++;
                totalStockQuantity += p.quantity;
                if (p.quantity <= 5) {
                    lowStockCount++;
                }
            }
            totalUnitsSold += p.totalSold;
        }

        totalSalesTransactions = ownerSalesCount[owner];
    }
}

