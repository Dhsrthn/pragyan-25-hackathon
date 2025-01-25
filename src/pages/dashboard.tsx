import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { ethers } from "ethers";
import { abi } from "./abi";
import { useEffect, useState } from "react";

const array = [1, 2, 3, 4, 5, 6, 7, 8];

function Dashboard() {
  const [opened, { open, close }] = useDisclosure(false);
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
  return (
    <>
      <Modal opened={opened} onClose={close}>
        Hello, this is centered modal
      </Modal>
      <div className="h-screen w-screen overflow-hidden">
        <div className="h-[10%]"></div>
        <div className="h-[90%] w-full px-56 overflow-auto pt-4">
          {/* <div>
                    <Button onClick={open} color='violet'>Open centered Modal</Button>
                </div> */}

          {/* List of properties */}
          <div className="w-full h-[80%] flex flex-wrap justify-center gap-8 items-start p-2">
            {array.map((item) => {
              return (
                <div className="w-60 h-60 rounded-xl shadow-2xl border-gray-100 border flex flex-col justify-between items-center p-5 transition-all hover:translate-x-2 hover:translate-y-2 ">
                  {/* Property Name */}
                  <span className="font-bold text-2xl">Property {item}</span>
                  {/* Buttons */}
                  <div>
                    <button
                      color="#007a00"
                      className="bg-[#007a00] px-10 py-1 rounded-lg text-white hover:bg-white hover:text-black hover: border-2 hover:border-[#007a00] hover:cursor-pointer "
                      onClick={open}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
