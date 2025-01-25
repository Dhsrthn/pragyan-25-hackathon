import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { ethers } from "ethers";
import { abi } from "./abi";
import { useEffect, useState } from "react";
import { RandomLoader } from '../components/loader/randomLoader';
import toast from "react-hot-toast";

const array = [1, 2, 3, 4, 5, 6, 7, 8];
const imgSrcs = ['image1.jpg', 'image2.jpg', 'image3.jpeg', 'image4.jpg']

function Dashboard() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loader, setLoader] = useState(false)

  const giveRandomNumber = (n: number): number => {
    return Math.floor(Math.random() * n)
  }
  const handleConfirmation = () => {
    setLoader(true)
    setTimeout(() => {
      toast.success('Request sent successfully')
      close()
      setLoader(false)
    }, 3200)
  }

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  useEffect(() => {
    console.log(ethers);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        const contractAddress = "0xE838CCa1369D091f308933bE7281ed17369DAFF5";

        const contract: any = new ethers.Contract(contractAddress, abi, signer);

        setContract(contract);
        setProvider(provider);
        console.log("Metamask is installed");
        console.log(contract, provider, account);
      } else {
        console.error("Metamask is not installed");
      }
    };
    if (provider) loadProvider();
  }, []);
  return (<>
    {loader ? (
      <div className='w-screen h-screen bg-[#00000087] absolute flex justify-center items-center overflow-hidden'><RandomLoader /></div>
    ) : <Modal.Root opened={opened} onClose={close}>
      <Modal.Overlay backgroundOpacity={0.55} blur={3} />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title className="text-4xl font-bold text-redd">
            Confirmation!
          </Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <div className="h-full w-full flex flex-col justify-between">
            <div className="text-2xl h-[80%] text-center">
              COST: ₹100000
            </div>
            <div className="w-full h-14 flex flex-row justify-evenly p-2 text-xl mt-1">
              <button
                className="w-2/5 h-full text-white hover:underline transition-all hover:tracking-wider bg-[#007a00] px-10 py-1 rounded-lg hover:bg-white hover:text-black hover: border-2 hover:border-[#007a00] hover:cursor-pointer"
                onClick={handleConfirmation}
              >
                Confirm
              </button>
              <button
                className="w-2/5 h-full bg-black rounded-lg text-white hover:underline transition-all hover:tracking-wider px-10 py-1 hover:bg-white hover:border hover:border-black hover:text-black hover:cursor-pointer"
                onClick={close}
              >
                Close
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>}

    <div className='h-screen w-screen overflow-hidden'>
      <div className="h-[10%]"></div>
      <div className='h-[90%] w-full px-56 overflow-auto pt-4'>

        {/* <div>
                <Button onClick={open} color='violet'>Open centered Modal</Button>
            </div> */}

        {/* List of properties */}
        <div className="w-full h-[80%] flex flex-wrap justify-center gap-8 items-start p-2">
          {array.map((item) => {
            return (
              <div className="w-60 h-60 rounded-xl border-gray-100 border flex flex-col justify-around items-center transition-all hover:translate-x-2 hover:translate-y-2" style={{ boxShadow: '5px 5px 15px -7px rgba(0,0,0,0.7)' }} >
                {/* Property Name */}
                <span className="font-bold text-2xl h-12 py-2">Property {item}</span>
                <img src={`/assets/images/buildings/${imgSrcs[giveRandomNumber(4)]}`} alt="" className='h-32 object-contain rounded-lg' />
                {/* Buttons */}
                <div className='h-12 py-2'>
                  <button color="#007a00" className='bg-[#007a00] px-10 py-1 rounded-lg text-white hover:bg-white hover:text-black hover: border-2 hover:border-[#007a00] hover:cursor-pointer' onClick={open}>Buy</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div >
  </>)
}

export default Dashboard;
