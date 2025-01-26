// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PropertyRegistry {
    struct Property {
        uint256 id;
        string propertyName;
        string location;
        uint256 area; // in square meters
        address owner;
        bool isROWApproved;
        uint256 price;
        string imageURL;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => address[]) public ROWApprovals;
    mapping(address => bool) public authorizedOfficials;
    uint256[] public propertyIds;
    uint256 private nextPropertyId = 1; // Start from 1

    event PropertyAdded(uint256 propertyId, address owner);
    event OwnershipTransferred(uint256 propertyId, address oldOwner, address newOwner);
    event ROWApproved(uint256 propertyId, address official);

    modifier onlyOwner(uint256 _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "Not property owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedOfficials[msg.sender], "Not an authorized official");
        _;
    }

    constructor() {
        authorizedOfficials[msg.sender] = true; // Contract deployer is an authorized official
    }

    function addProperty(
        string memory _propertyName, 
        string memory _location, 
        uint256 _area, 
        uint256 _price, 
        string memory _imageURL
    ) external {
        uint256 propertyId = nextPropertyId++;

        properties[propertyId] = Property(
            propertyId, 
            _propertyName, 
            _location, 
            _area, 
            msg.sender, // Owner is msg.sender
            false, 
            _price, 
            _imageURL
        );

        propertyIds.push(propertyId);
        emit PropertyAdded(propertyId, msg.sender);
    }

    function getProperty(uint256 _propertyId) external view returns (Property memory) {
        require(properties[_propertyId].id != 0, "Property does not exist");
        return properties[_propertyId];
    }

    function transferOwnership(uint256 _propertyId, address _newOwner) external onlyOwner(_propertyId) {
        require(_newOwner != address(0), "Invalid new owner address");

        address oldOwner = properties[_propertyId].owner;
        properties[_propertyId].owner = _newOwner;

        emit OwnershipTransferred(_propertyId, oldOwner, _newOwner);
    }

    function approveROW(uint256 _propertyId) external onlyAuthorized {
        require(properties[_propertyId].id != 0, "Property does not exist");
        require(!properties[_propertyId].isROWApproved, "Already approved");

        properties[_propertyId].isROWApproved = true;
        ROWApprovals[_propertyId].push(msg.sender);

        emit ROWApproved(_propertyId, msg.sender);
    }

    function getROWApprovals(uint256 _propertyId) external view returns (address[] memory) {
        return ROWApprovals[_propertyId];
    }

    function getAllProperties() external view returns (Property[] memory) {
        Property[] memory allProperties = new Property[](propertyIds.length);
        for (uint256 i = 0; i < propertyIds.length; i++) {
            allProperties[i] = properties[propertyIds[i]];
        }
        return allProperties;
    }

    function addAuthorizedOfficial(address _official) external onlyAuthorized {
        authorizedOfficials[_official] = true;
    }

    function removeAuthorizedOfficial(address _official) external onlyAuthorized {
        authorizedOfficials[_official] = false;
    }
}