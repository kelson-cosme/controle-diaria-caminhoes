import "./Home.css";
import { db } from "../../componets/firebaseConfig/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import "./home.css"

function Home() {
  const [identificador, setIdentificador] = useState([]);

  async function getData() {
    const querySnapshot = await getDocs(collection(db, "caminhoes"));

    const placasArray = [];
    querySnapshot.forEach((doc) => {
      console.log(doc.id, doc.data());
      placasArray.push(doc.id);
    });

    setIdentificador(placasArray); // Atualiza o estado com todas as placas de uma vez
  }

  // Executar apenas uma vez quando o componente for montado
  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <h1>Altma - Industrial</h1>
      <ul>
        {identificador.map((placa, index) => (
          <li key={index}> <Link to={`/${placa}`}> {placa}</Link></li>
        ))}
      </ul>
    </>
  );
}

export default Home;
