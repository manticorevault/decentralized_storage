import Dbox from '../abis/Dbox.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require("ipfs-http-client")
const ipfs = ipfsClient({ host: "ipfs.infura.io", port: 5001, protocol: "https" })

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert("This browser is not connected to Ethereum. Try the Metamask add-on")
    }
  }

  async loadBlockchainData() {
    //Declare Web3
    const web3 = window.web3

    //Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    //Network ID
    const networkdId = await web3.eth.net.getId()
    const networkData = Dbox.networks[networkdId]

    //IF got connection, get data from contracts
    if (networkData) {
      //Assign contract
      const dbox = new web3.eth.Contract(Dbox.abi, networkData.address)
      this.setState({ dbox })
      //Get files amount
      const fileCount = await dbox.methods.fileCount().call()
      this.setState({ fileCount })

      //Load files & sort by the latest uploaded files
      for (let counter = fileCount; counter >= 1; counter--) {
        const file = await dbox.methods.files(counter).call()
        this.setState({
          files: [...this.state.files, file]
        })
      }

    } else {
      //alert Error
      window.alert("Dbox contract not deployed to the detected Network")
    }
  }

  // Get file from user
  captureFile = event => {
    event.preventDefault()

    const file = event.target.files[0]
    const reader = new window.FileReader()

    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name
      })

      console.log("Buffer", this.state.buffer)
    }
  }


  //Upload File
  uploadFile = description => {
    console.log("Submitting file to IPFS")

    //Add file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log("IPFS result", result)

      //Check If error
      if (error) {
        //Return error
        console.log(error)

      }

      //Set state to loading
      this.setState({ loading: true })

      //Assign value for the file without extension
      if (this.state.type === "") {
        this.setState({ type: "none" })
      }

      //Call smart contract uploadFile function 
      this.state.dbox.methods.uploadFile(
        result[0].hash,
        result[0].size,
        this.state.type,
        this.state.name,
        description)
        .send({
          from: this.state.account
        })
        .on("transactionHash", (hash) => {
          this.setState({
            loading: false,
            type: null,
            name: null
          })

          window.location.reload()
        }).on("error", (e) => {
          window.alert("Error")
          this.setState({ loading: false })
        })
    })
  }

  //Set states
  constructor(props) {
    super(props)
    this.state = {
      account: "",
      dbox: null,
      files: [],
      loading: false,
      type: null,
      name: null
    }

    //Bind functions
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            files={this.state.files}
            captureFile={this.captureFile}
            uploadFile={this.uploadFile}
          />
        }
      </div>
    );
  }
}

export default App;