import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { Stocklet } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Stocklet Smart Contract", function () {
  let stocklet: Stocklet;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const StockletFactory = await ethers.getContractFactory("Stocklet");
    stocklet = await StockletFactory.deploy();
    await stocklet.waitForDeployment();
  });

  describe("Product Creation (addProduct)", function () {
    it("should allow a business owner to add a product", async function () {
      const tx = await stocklet.connect(alice).addProduct("Artisan Coffee Beans", 50, 15);
      await expect(tx)
        .to.emit(stocklet, "ProductAdded")
        .withArgs(1, alice.address, "Artisan Coffee Beans", 50, 15, (await ethers.provider.getBlock("latest"))!.timestamp);

      const products = await stocklet.connect(alice).getMyProducts();
      expect(products.length).to.equal(1);
      expect(products[0].id).to.equal(1);
      expect(products[0].name).to.equal("Artisan Coffee Beans");
      expect(products[0].quantity).to.equal(50);
      expect(products[0].price).to.equal(15);
      expect(products[0].owner).to.equal(alice.address);
      expect(products[0].isActive).to.be.true;
      expect(products[0].totalSold).to.equal(0);
    });

    it("should reject product with empty name", async function () {
      await expect(
        stocklet.connect(alice).addProduct("", 10, 5)
      ).to.be.revertedWith("Stocklet: product name cannot be empty");
    });

    it("should correctly increment product count for owner", async function () {
      expect(await stocklet.getProductCount(alice.address)).to.equal(0);
      await stocklet.connect(alice).addProduct("Product A", 10, 100);
      await stocklet.connect(alice).addProduct("Product B", 20, 200);
      expect(await stocklet.getProductCount(alice.address)).to.equal(2);
    });
  });

  describe("Product Updates (updateProduct)", function () {
    beforeEach(async function () {
      await stocklet.connect(alice).addProduct("Original Blend", 30, 20);
    });

    it("should allow owner to update product details", async function () {
      const tx = await stocklet.connect(alice).updateProduct(1, "Premium Blend", 45, 25);
      await expect(tx).to.emit(stocklet, "ProductUpdated");

      const products = await stocklet.connect(alice).getMyProducts();
      expect(products[0].name).to.equal("Premium Blend");
      expect(products[0].quantity).to.equal(45);
      expect(products[0].price).to.equal(25);
    });

    it("should prevent non-owner from updating product", async function () {
      await expect(
        stocklet.connect(bob).updateProduct(1, "Hacked Product", 100, 1)
      ).to.be.revertedWith("Stocklet: caller is not product owner");
    });

    it("should reject empty name on update", async function () {
      await expect(
        stocklet.connect(alice).updateProduct(1, "", 45, 25)
      ).to.be.revertedWith("Stocklet: product name cannot be empty");
    });
  });

  describe("Record Sales (recordSale)", function () {
    beforeEach(async function () {
      await stocklet.connect(alice).addProduct("Scented Candle", 10, 30);
    });

    it("should allow owner to record sale and reduce stock", async function () {
      const tx = await stocklet.connect(alice).recordSale(1, 4);
      await expect(tx)
        .to.emit(stocklet, "SaleRecorded")
        .withArgs(1, alice.address, 4, 6, (await ethers.provider.getBlock("latest"))!.timestamp);

      const products = await stocklet.connect(alice).getMyProducts();
      expect(products[0].quantity).to.equal(6);
      expect(products[0].totalSold).to.equal(4);
    });

    it("should prevent recording sale of zero units", async function () {
      await expect(
        stocklet.connect(alice).recordSale(1, 0)
      ).to.be.revertedWith("Stocklet: quantity sold must be greater than zero");
    });

    it("should prevent sales exceeding available stock", async function () {
      await expect(
        stocklet.connect(alice).recordSale(1, 11)
      ).to.be.revertedWith("Stocklet: sale exceeds available stock");
    });

    it("should prevent non-owner from recording sale", async function () {
      await expect(
        stocklet.connect(bob).recordSale(1, 2)
      ).to.be.revertedWith("Stocklet: caller is not product owner");
    });
  });

  describe("Product Deletion (deleteProduct)", function () {
    beforeEach(async function () {
      await stocklet.connect(alice).addProduct("Old Stock Item", 5, 10);
    });

    it("should allow owner to delete product from active inventory", async function () {
      const tx = await stocklet.connect(alice).deleteProduct(1);
      await expect(tx).to.emit(stocklet, "ProductDeleted");

      const products = await stocklet.connect(alice).getMyProducts();
      expect(products[0].isActive).to.be.false;
    });

    it("should prevent non-owner from deleting product", async function () {
      await expect(
        stocklet.connect(bob).deleteProduct(1)
      ).to.be.revertedWith("Stocklet: caller is not product owner");
    });

    it("should prevent operations on deleted products", async function () {
      await stocklet.connect(alice).deleteProduct(1);

      await expect(
        stocklet.connect(alice).recordSale(1, 1)
      ).to.be.revertedWith("Stocklet: product is inactive or deleted");

      await expect(
        stocklet.connect(alice).updateProduct(1, "New Name", 10, 10)
      ).to.be.revertedWith("Stocklet: product is inactive or deleted");

      await expect(
        stocklet.connect(alice).deleteProduct(1)
      ).to.be.revertedWith("Stocklet: product is inactive or deleted");
    });
  });

  describe("Wallet Isolation & Owner Statistics", function () {
    it("should ensure each business wallet sees and manages only its own inventory", async function () {
      await stocklet.connect(alice).addProduct("Alice's Item 1", 20, 10);
      await stocklet.connect(alice).addProduct("Alice's Item 2", 3, 15);
      await stocklet.connect(bob).addProduct("Bob's Special Item", 50, 99);

      const aliceProducts = await stocklet.connect(alice).getMyProducts();
      const bobProducts = await stocklet.connect(bob).getMyProducts();

      expect(aliceProducts.length).to.equal(2);
      expect(aliceProducts[0].name).to.equal("Alice's Item 1");
      expect(aliceProducts[1].name).to.equal("Alice's Item 2");

      expect(bobProducts.length).to.equal(1);
      expect(bobProducts[0].name).to.equal("Bob's Special Item");
      expect(bobProducts[0].owner).to.equal(bob.address);
    });

    it("should accurately return owner stats", async function () {
      await stocklet.connect(alice).addProduct("Healthy Item", 20, 10);
      await stocklet.connect(alice).addProduct("Low Stock Item", 4, 15);
      await stocklet.connect(alice).recordSale(1, 5); // 5 sold, 15 remaining

      const stats = await stocklet.getOwnerStats(alice.address);
      expect(stats.totalActiveProducts).to.equal(2);
      expect(stats.totalStockQuantity).to.equal(19); // 15 + 4
      expect(stats.lowStockCount).to.equal(1); // item 2 has 4 <= 5
      expect(stats.totalUnitsSold).to.equal(5);
      expect(stats.totalSalesTransactions).to.equal(1);
    });
  });
});
