interface ZapperInterface {
  function ZapIn ( address _FromTokenContractAddress, address _pairAddress, uint256 _amount, uint256 _minPoolTokens, address _swapTarget, bytes swapData, address affiliate, bool transferResidual, bool shouldSellEntireBalance ) external returns ( uint256 );
  function affiliateBalance ( address, address ) external view returns ( uint256 );
  function affiliates ( address ) external view returns ( bool );
  function affilliateWithdraw ( address[] tokens ) external;
  function approvedTargets ( address ) external view returns ( bool );
  function feeWhitelist ( address ) external view returns ( bool );
  function goodwill (  ) external view returns ( uint256 );
  function owner (  ) external view returns ( address );
  function renounceOwnership (  ) external;
  function setApprovedTargets ( address[] targets, bool[] isApproved ) external;
  function set_affiliate ( address _affiliate, bool _status ) external;
  function set_feeWhitelist ( address zapAddress, bool status ) external;
  function set_new_affiliateSplit ( uint256 _new_affiliateSplit ) external;
  function set_new_goodwill ( uint256 _new_goodwill ) external;
  function stopped (  ) external view returns ( bool );
  function toggleContractActive (  ) external;
  function totalAffiliateBalance ( address ) external view returns ( uint256 );
  function transferOwnership ( address newOwner ) external;
  function withdrawTokens ( address[] tokens ) external;
}

