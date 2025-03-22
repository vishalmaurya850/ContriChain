pragma solidity ^0.8.17;

contract Crowdfunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        string imageUrl;
        bool claimed;
        mapping(address => uint256) contributions;
    }

    uint256 public campaignCount = 0;
    mapping(uint256 => Campaign) public campaigns;
    
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        string title,
        uint256 goal,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );
    
    event FundsClaimed(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 amount
    );
    
    event RefundClaimed(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays,
        string memory _imageUrl
    ) public returns (uint256) {
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");
        
        Campaign storage campaign = campaigns[campaignCount];
        campaign.owner = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.goal = _goal;
        campaign.deadline = block.timestamp + (_durationInDays * 1 days);
        campaign.amountRaised = 0;
        campaign.imageUrl = _imageUrl;
        campaign.claimed = false;
        
        emit CampaignCreated(
            campaignCount,
            msg.sender,
            _title,
            _goal,
            campaign.deadline
        );
        
        campaignCount++;
        return campaignCount - 1;
    }
    
    function contribute(uint256 _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");
        
        campaign.contributions[msg.sender] += msg.value;
        campaign.amountRaised += msg.value;
        
        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }
    
    function claimFunds(uint256 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(msg.sender == campaign.owner, "Only the campaign owner can claim funds");
        require(block.timestamp >= campaign.deadline, "Campaign has not ended yet");
        require(campaign.amountRaised >= campaign.goal, "Campaign did not reach its goal");
        require(!campaign.claimed, "Funds have already been claimed");
        
        campaign.claimed = true;
        payable(campaign.owner).transfer(campaign.amountRaised);
        
        emit FundsClaimed(_campaignId, campaign.owner, campaign.amountRaised);
    }
    
    function claimRefund(uint256 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(block.timestamp >= campaign.deadline, "Campaign has not ended yet");
        require(campaign.amountRaised < campaign.goal, "Campaign reached its goal");
        require(campaign.contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 amount = campaign.contributions[msg.sender];
        campaign.contributions[msg.sender] = 0;
        campaign.amountRaised -= amount;
        
        payable(msg.sender).transfer(amount);
        
        emit RefundClaimed(_campaignId, msg.sender, amount);
    }
    
    function getCampaignDetails(uint256 _campaignId) public view returns (
        address owner,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 deadline,
        uint256 amountRaised,
        string memory imageUrl,
        bool claimed
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        
        return (
            campaign.owner,
            campaign.title,
            campaign.description,
            campaign.goal,
            campaign.deadline,
            campaign.amountRaised,
            campaign.imageUrl,
            campaign.claimed
        );
    }
    
    function getContribution(uint256 _campaignId, address _contributor) public view returns (uint256) {
        return campaigns[_campaignId].contributions[_contributor];
    }
}

