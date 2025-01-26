//@ts-nocheck
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { ethers } from "ethers";
import { abi } from "./abi";
import { useEffect, useState } from "react";
import { RandomLoader } from '../components/loader/randomLoader';
import toast from "react-hot-toast";
import PlotInformation from "../components/information/information";

const array = [1, 2, 3, 4, 5, 6, 7, 8];
const imgSrcs = ['image1.jpg', 'image2.jpg', 'image3.jpeg', 'image4.jpg']

enum ModalMode {
  Information,
  AddElement
}

const AddElementModal = () => {
  return <></>
}

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
  const [modalMode, setModalModal] = useState(ModalMode.Information);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  useEffect(() => {
    console.log(ethers);
    //@ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        //@ts-ignore
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        //@ts-ignore
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

  const openInformationModal = () => {
    setModalModal(ModalMode.Information)
    open()
  }

  const openAddElementModal = () => {
    setModalModal(ModalMode.AddElement)
    open()
  }


  return (<>
    {loader ? (
      <div className='w-screen h-screen bg-[#00000087] absolute flex justify-center items-center overflow-hidden'><RandomLoader /></div>
    ) : <Modal.Root opened={opened} onClose={close}>
      <Modal.Overlay backgroundOpacity={0.55} blur={3} />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title className="text-4xl font-bold text-redd">
            {modalMode === ModalMode.Information ? "Plot Information" : "Add Element"}
          </Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          {/* <div className="h-full w-full flex flex-col justify-between">
            <div className="text-2xl h-[80%] text-center">
              COST: ₹100000
            </div>
            <div className="w-full h-14 flex flex-row justify-evenly p-2 text-xl mt-1">
              <div className="w-2/5 h-full bg-black">
                <button
                  className="w-full h-full text-white hover:underline transition-all hover:tracking-wider bg-[#007a00] px-10 py-1  hover:bg-white hover:text-black hover:border-2 hover:border-[#007a00] hover:cursor-pointer -translate-x-1 -translate-y-1"
                  onClick={handleConfirmation}
                >
                  Confirm
                </button>
              </div>
              <div className="w-2/5 h-full bg-black">
                <button
                  className="w-full h-full bg-red-900 text-white hover:underline transition-all hover:tracking-wider px-10 py-1 hover:bg-white hover:border hover:border-black hover:text-black hover:cursor-pointer -translate-x-1 -translate-y-1"
                  onClick={close}
                >
                  Close
                </button>
              </div>
            </div>
          </div> */}
          {modalMode === ModalMode.Information && <><PlotInformation /></>}
          {modalMode === ModalMode.AddElement && <><AddElementModal /> </>}
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
          {array.map((item, index) => {
            return (
              <>
                <div className="w-56 h-60 bg-black">
                  <div className={`w-full h-60 bg-white flex flex-col justify-around items-center ${!loader && "-translate-x-1 -translate-y-1"}  border `} >
                    {/* Property Name */}
                    <span className="font-bold text-2xl h-12 py-2">Property {item}</span>
                    <img src={`/assets/images/buildings/${imgSrcs[index % 4]}`} alt="" className='h-32 object-contain' />
                    {/* Buttons */}
                    <div className='h-12 py-2'>
                      <div className="bg-black">
                        <button
                          className={`px-10 py-1 hover:-translate-x-2 ${!loader && "-translate-x-1 -translate-y-1"}  hover:-translate-y-2 transition-all hover:border-2 bg-[#007a00] text-white hover:text-[#007a00] hover:bg-white hover:border-[#007a00] font-semibold hover:cursor-pointer`}
                          onClick={openInformationModal}
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )
          })}
        </div>
      </div>
      <div className="fixed right-10 bottom-10 text-[#007a00]">
        <img src="./assets/plus.svg" alt="" className="size-20 hover:cursor-pointer" onClick={openAddElementModal} />
      </div>
    </div >
  </>)
}

export default Dashboard;
