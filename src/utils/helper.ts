//@ts-nocheck
 
import { Contract, ethers } from "ethers";

export const addProperty = async (
  propertyId: number,
  propertyName: string,
  location: string,
  area: number,
  owner: string,
  price: number,
  imageURL: string,
  contract: Contract
) => {
  try {
    const tx = await contract.addProperty(
      propertyId,
      propertyName,
      location,
      area,
      owner,
      price,
      imageURL
    );
    await tx.wait();
    console.log("Property added:", tx);
  } catch (error) {
    console.error("Error adding property:", error);
  }
};

export const getProperty = async (propertyId: number, contract: Contract) => {
  try {
    const property = await contract.getProperty(propertyId);
    console.log("Property details:", property);
    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
  }
};

export const getAllProperties = async (contract: Contract) => {
  try {
    const properties = await contract.getAllProperties();
    console.log("All properties:", properties);
    return properties;
  } catch (error) {
    console.error("Error fetching properties:", error);
  }
};

export const transferOwnership = async (
  propertyId: number,
  newOwner: string,
  contract: Contract
) => {
  try {
    const tx = await contract.transferOwnership(propertyId, newOwner);
    await tx.wait();
    console.log("Ownership transferred:", tx);
  } catch (error) {
    console.error("Error transferring ownership:", error);
  }
};

export const approveROW = async (propertyId: number, contract: Contract) => {
  try {
    const tx = await contract.approveROW(propertyId);
    await tx.wait();
    console.log("ROW approved:", tx);
  } catch (error) {
    console.error("Error approving ROW:", error);
  }
};

export const getROWApprovals = async (
  propertyId: number,
  contract: Contract
) => {
  try {
    const approvals = await contract.getROWApprovals(propertyId);
    console.log("ROW Approvals:", approvals);
    return approvals;
  } catch (error) {
    console.error("Error fetching ROW approvals:", error);
  }
};

export const addAuthorizedOfficial = async (
  official: string,
  contract: Contract
) => {
  try {
    const tx = await contract.addAuthorizedOfficial(official);
    await tx.wait();
    console.log("Authorized official added:", tx);
  } catch (error) {
    console.error("Error adding authorized official:", error);
  }
};

export const removeAuthorizedOfficial = async (
  official: string,
  contract: Contract
) => {
  try {
    const tx = await contract.removeAuthorizedOfficial(official);
    await tx.wait();
    console.log("Authorized official removed:", tx);
  } catch (error) {
    console.error("Error removing authorized official:", error);
  }
};
