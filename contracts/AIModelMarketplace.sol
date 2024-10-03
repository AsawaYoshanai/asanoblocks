// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIMarketplace {
    struct Model {
        string name;
        string description;
        uint256 price;
        address payable creator;
        uint8 ratingCount;
        uint256 totalRating;
    }

    Model[] public models;

    event ModelListed(uint256 modelId, string name, uint256 price);
    event ModelPurchased(uint256 modelId, address buyer);
    event ModelRated(uint256 modelId, uint8 rating);

    function listModel(string memory name, string memory description, uint256 price) public {
        models.push(Model({
            name: name,
            description: description,
            price: price,
            creator: payable(msg.sender),
            ratingCount: 0,
            totalRating: 0
        }));
        
        emit ModelListed(models.length - 1, name, price);
    }

    function purchaseModel(uint256 modelId) public payable {
        require(modelId < models.length, "Model does not exist.");
        require(msg.value == models[modelId].price, "Incorrect price sent.");
        
        models[modelId].creator.transfer(msg.value);
        
        emit ModelPurchased(modelId, msg.sender);
    }

    function rateModel(uint256 modelId, uint8 rating) public {
        require(modelId < models.length, "Model does not exist.");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5.");

        models[modelId].ratingCount++;
        models[modelId].totalRating += rating;

        emit ModelRated(modelId, rating);
    }

    function withdrawFunds() public {
        require(msg.sender == address(this), "Only contract owner can withdraw.");
        payable(msg.sender).transfer(address(this).balance);
    }

    function getModelDetails(uint256 modelId) public view returns (string memory name, string memory description, uint256 price, address creator, uint8 averageRating) {
        require(modelId < models.length, "Model does not exist.");
        
        Model storage model = models[modelId];
        
        if (model.ratingCount == 0) {
            return (model.name, model.description, model.price, model.creator, 0);
        }
        
        return (model.name, model.description, model.price, model.creator, uint8(model.totalRating / model.ratingCount));
    }
}