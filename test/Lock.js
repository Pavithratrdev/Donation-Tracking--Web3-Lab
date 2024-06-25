// import hardhat from "hardhat";
const { ethers } = hardhat;
// import { expect } from "chai";
import { expect } from "chai";
const expect = expect;


describe("CharityTracker Contract", function () {
  let CharityTracker;
  let charityTracker;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Deploy the CharityTracker contract
    CharityTracker = await ethers.getContractFactory("CharityTracker");
    [owner, addr1, addr2] = await ethers.getSigners();
    charityTracker = await CharityTracker.deploy();
    //await charityTracker.deployed();
  });

  it("Should deploy CharityTracker contract correctly", async function () {
    expect(charityTracker.address).to.not.equal(0);
  });

  it("Should receive donations", async function () {
    const donationAmount = ethers.utils.parseEther("1.0");

    // Make a donation
    await addr1.sendTransaction({
      to: charityTracker.address,
      value: donationAmount,
    });

    // Check the first donation
    const donations = await charityTracker.getAllDonations();
    expect(donations.length).to.equal(1);
    expect(donations[0].amount).to.equal(donationAmount);
    expect(donations[0].donor).to.equal(addr1.address);
  });

  it("Should record spendings by the owner", async function () {
    const donationAmount = ethers.utils.parseEther("2.0");
    await addr1.sendTransaction({ to: charityTracker.address, value: donationAmount });

    const spendingAmount = ethers.utils.parseEther("1.0");
    const spendingDescription = "Test spending";

    // Spend from the contract
    await expect(charityTracker.connect(owner).spend(spendingAmount, spendingDescription))
      .to.emit(charityTracker, "SpendingMade")
      .withArgs(spendingAmount, spendingDescription);

    // Check the spending record
    const spendings = await charityTracker.getAllSpendings();
    expect(spendings.length).to.equal(1);
    expect(spendings[0].amount).to.equal(spendingAmount);
    expect(spendings[0].description).to.equal(spendingDescription);
  });

  it("Should revert spending if not called by the owner", async function () {
    const donationAmount = ethers.utils.parseEther("2.0");
    await addr1.sendTransaction({ to: charityTracker.address, value: donationAmount });

    const spendingAmount = ethers.utils.parseEther("1.0");
    const spendingDescription = "Test spending";

    // Try to spend from the contract as addr1 (not owner)
    await expect(charityTracker.connect(addr1).spend(spendingAmount, spendingDescription))
      .to.be.revertedWith("You are not the owner");

    // Verify no spendings recorded
    const spendings = await charityTracker.getAllSpendings();
    expect(spendings.length).to.equal(0);
  });

  it("Should get the contract balance", async function () {
    const donationAmount = ethers.utils.parseEther("1.0");
    await addr1.sendTransaction({ to: charityTracker.address, value: donationAmount });

    const balance = await charityTracker.getBalance();
    expect(balance).to.equal(donationAmount);
  });
});
