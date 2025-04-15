import "./Home.css";
import { db } from "../../componets/firebaseConfig/firebaseConfig.ts";
import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png"

function Home() {
  const [identificador, setIdentificador] = useState<string[]>([]);

  async function getData() {
    const querySnapshot = await getDocs(collection(db, "caminhoes"));
    
    const placasArray: string[] = [];
    querySnapshot.forEach((doc) => {
      placasArray.push(doc.id);
    });

    setIdentificador(placasArray);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
    <h1 style={{fontSize: "40px", margin: "15px"}}>Selecione a Placa do Automóvel</h1>
      <ul className="placas">
        {identificador.map((placa, index) => (
          <li key={index}>
            <Link to={`/${placa}`}>{placa}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Home;
