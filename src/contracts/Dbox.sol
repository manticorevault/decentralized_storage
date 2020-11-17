pragma solidity ^0.5.0;

contract Dbox {
  // Name
  string public name = "Dbox";

  // Number of files
  uint public fileCount = 0;

  // Mapping fileId => Struct 
  mapping (uint => File) public files;

  // File Struct
  struct File {
    uint fileId;
    string fileHash;
    uint fileSize;
    string fileType;
    string fileName;
    string fileDescription;
    uint uploadTime;
    address payable uploader;
  }

  // Event
  event FileUpload(
    uint fileId,
    string fileHash,
    uint fileSize,
    string fileType,
    string fileName,
    string fileDescription,
    uint uploadTime,
    address payable uploader
  );

  constructor() public {

  }

  // Upload File function
  function uploadFile(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDescription) public {

    // Make sure the file hash exists
    require(bytes(_fileHash).length > 0);
    
    // Make sure file type exists
    require(bytes(_fileType).length > 0);

    // Make sure file description exists
    require(bytes(_fileDescription).length > 0);

    // Make sure file fileName exists
    require(bytes(_fileName).length > 0);

    // Make sure uploader address exists
    require(msg.sender != address(0));

    // Make sure file size is more than 0
    require(_fileSize > 0);

    // Update the fileCount
    fileCount++;

    // Create a new File Struct and add it to the Map
    files[fileCount] = File(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDescription, now, msg.sender);

    // Trigger an event
    emit FileUpload(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDescription, now, msg.sender);

  }



}