const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RedPacket", function () {
    let redPacket;
    let owner;
    let addr1, addr2, addr3, addr4, addr5, addr6, addr7;
    let TOTAL_AMOUNT;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();
        
        // 使用 ethers.parseEther 或 ethers.utils.parseEther
        TOTAL_AMOUNT = ethers.parseEther ? ethers.parseEther("0.05") : ethers.utils.parseEther("0.05");
        
        const RedPacket = await ethers.getContractFactory("RedPacket");
        redPacket = await RedPacket.deploy();
        await redPacket.deployed();
        
        // 向合约充值0.05 ETH (使用 receive 函数)
        await owner.sendTransaction({
            to: redPacket.address,
            value: TOTAL_AMOUNT
        });
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await redPacket.owner()).to.equal(owner.address);
        });

        it("Should initialize with correct values", async function () {
            const info = await redPacket.getRedPacketInfo();
            expect(info._remainingAmount).to.equal(TOTAL_AMOUNT); // 充值后应该等于 TOTAL_AMOUNT
            expect(info._claimedCount).to.equal(0);
            expect(info._maxRecipients).to.equal(6);
            expect(info._isFinished).to.equal(false);
        });

        it("Should have correct contract balance", async function () {
            expect(await redPacket.getContractBalance()).to.equal(TOTAL_AMOUNT);
        });
    });

    describe("Claiming Red Packets", function () {
        it("Should allow users to claim red packets", async function () {
            const balanceBefore = await addr1.getBalance();
            
            const tx = await redPacket.connect(addr1).claimRedPacket();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice || receipt.gasPrice);
            
            const balanceAfter = await addr1.getBalance();
            const claimedAmount = await redPacket.claimedAmount(addr1.address);
            
            expect(claimedAmount).to.be.gt(0);
            expect(await redPacket.hasClaimed(addr1.address)).to.equal(true);
            expect(balanceAfter.add(gasUsed)).to.be.gt(balanceBefore);
        });

        it("Should not allow double claiming", async function () {
            await redPacket.connect(addr1).claimRedPacket();
            
            await expect(
                redPacket.connect(addr1).claimRedPacket()
            ).to.be.revertedWith("Already claimed");
        });

        it("Should allow exactly 6 people to claim", async function () {
            await redPacket.connect(addr1).claimRedPacket();
            await redPacket.connect(addr2).claimRedPacket();
            await redPacket.connect(addr3).claimRedPacket();
            await redPacket.connect(addr4).claimRedPacket();
            await redPacket.connect(addr5).claimRedPacket();
            await redPacket.connect(addr6).claimRedPacket();
            
            const info = await redPacket.getRedPacketInfo();
            expect(info._claimedCount).to.equal(6);
            expect(info._isFinished).to.equal(true);
            
            // 第7个人不应该能领取
            await expect(
                redPacket.connect(addr7).claimRedPacket()
            ).to.be.revertedWith("All red packets claimed");
        });

        it("Should distribute all ETH among claimers", async function () {
            await redPacket.connect(addr1).claimRedPacket();
            await redPacket.connect(addr2).claimRedPacket();
            await redPacket.connect(addr3).claimRedPacket();
            await redPacket.connect(addr4).claimRedPacket();
            await redPacket.connect(addr5).claimRedPacket();
            await redPacket.connect(addr6).claimRedPacket();
            
            const totalClaimed = (
                await redPacket.claimedAmount(addr1.address)
            ).add(
                await redPacket.claimedAmount(addr2.address)
            ).add(
                await redPacket.claimedAmount(addr3.address)
            ).add(
                await redPacket.claimedAmount(addr4.address)
            ).add(
                await redPacket.claimedAmount(addr5.address)
            ).add(
                await redPacket.claimedAmount(addr6.address)
            );
            
            expect(totalClaimed).to.equal(TOTAL_AMOUNT);
            expect(await redPacket.remainingAmount()).to.equal(0);
        });

        it("Should emit events correctly", async function () {
            const tx = await redPacket.connect(addr1).claimRedPacket();
            const claimedAmount = await redPacket.claimedAmount(addr1.address);
            
            await expect(tx)
                .to.emit(redPacket, "RedPacketClaimed")
                .withArgs(addr1.address, claimedAmount);
        });

        it("Should not allow claiming when no funds available", async function () {
            // 部署一个新的合约但不充值
            const RedPacket = await ethers.getContractFactory("RedPacket");
            const emptyRedPacket = await RedPacket.deploy();
            await emptyRedPacket.deployed();
            
            await expect(
                emptyRedPacket.connect(addr1).claimRedPacket()
            ).to.be.revertedWith("No remaining amount");
        });
    });

    describe("Getters", function () {
        it("Should return correct claimers list", async function () {
            await redPacket.connect(addr1).claimRedPacket();
            await redPacket.connect(addr2).claimRedPacket();
            
            const claimers = await redPacket.getClaimers();
            expect(claimers).to.deep.equal([addr1.address, addr2.address]);
        });
    });

    describe("Owner Functions", function () {
        it("Should allow owner to deposit more ETH", async function () {
            const additionalAmount = ethers.parseEther ? ethers.parseEther("0.01") : ethers.utils.parseEther("0.01");
            
            await redPacket.connect(owner).deposit({ value: additionalAmount });
            
            expect(await redPacket.remainingAmount()).to.equal(
                TOTAL_AMOUNT.add(additionalAmount)
            );
        });

        it("Should allow owner to withdraw after completion", async function () {
            // 让所有人都领取红包
            await redPacket.connect(addr1).claimRedPacket();
            await redPacket.connect(addr2).claimRedPacket();
            await redPacket.connect(addr3).claimRedPacket();
            await redPacket.connect(addr4).claimRedPacket();
            await redPacket.connect(addr5).claimRedPacket();
            await redPacket.connect(addr6).claimRedPacket();
            
            // 向合约发送一些额外的ETH
            const additionalAmount = ethers.parseEther ? ethers.parseEther("0.01") : ethers.utils.parseEther("0.01");
            await owner.sendTransaction({
                to: redPacket.address,
                value: additionalAmount
            });
            
            const ownerBalanceBefore = await owner.getBalance();
            const contractBalanceBefore = await redPacket.getContractBalance();
            
            const tx = await redPacket.connect(owner).emergencyWithdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice || receipt.gasPrice);
            
            const ownerBalanceAfter = await owner.getBalance();
            const contractBalanceAfter = await redPacket.getContractBalance();
            
            // 验证合约余额为0
            expect(contractBalanceAfter).to.equal(0);
            
            // 验证owner收到了额外的ETH（减去gas费用）
            expect(ownerBalanceAfter).to.equal(
                ownerBalanceBefore.add(contractBalanceBefore).sub(gasUsed)
            );
        });

        it("Should not allow non-owner to withdraw", async function () {
            await expect(
                redPacket.connect(addr1).emergencyWithdraw()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should not allow withdraw before completion", async function () {
            await expect(
                redPacket.connect(owner).emergencyWithdraw()
            ).to.be.revertedWith("Red packet not finished yet");
        });

        it("Should not allow non-owner to deposit", async function () {
            const additionalAmount = ethers.parseEther ? ethers.parseEther("0.01") : ethers.utils.parseEther("0.01");
            
            await expect(
                redPacket.connect(addr1).deposit({ value: additionalAmount })
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});