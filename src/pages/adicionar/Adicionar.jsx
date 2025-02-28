import { useState } from "react";
import { db } from "../../componets/firebaseConfig/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Importação de getDoc para verificar a existência do documento
import "./Adicionar.css";

function Adicionar({ placa }) {
  const [operador, setOperador] = useState("");
  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");
  const [data, setData] = useState(""); // Campo para data
  const [modo, setModo] = useState("hora"); // Valor inicial do modo, por hora
  const [valorHora, setValorHora] = useState(""); // Valor da hora
  const [valorDiaria, setValorDiaria] = useState(""); // Valor da diária

  // Função para formatar a hora e data para o Firestore (Usando horário local)
  const formatarData = (dataEscolhida, hora) => {
    const [horas, minutos] = hora.split(":");
    const [ano, mes, dia] = dataEscolhida.split("-");

    // Criando um objeto Date no horário local
    const dataFormatada = new Date(
      parseInt(ano), // Ano
      parseInt(mes) - 1, // Mês (0-11, então subtraímos 1)
      parseInt(dia), // Dia
      parseInt(horas), // Hora
      parseInt(minutos), // Minutos
      0, // Segundo
      0  // Milissegundo
    );

    return dataFormatada;
  };

  // Função para formatar a data no formato dd-mm-aa
  const formatarIDData = (dataEscolhida) => {
    const [ano, mes, dia] = dataEscolhida.split("-"); // Decompor a data no formato yyyy-mm-dd
    return `${dia}-${mes}-${ano.substring(2)}`; // Retorna no formato dd-mm-aa
  };

  // Função para calcular o valor dependendo do modo
  const calcularValor = () => {
    if (modo === "hora" && valorHora) {
      const [hEntrada, mEntrada] = entrada.split(":");
      const [hSaida, mSaida] = saida.split(":");
      
      const entradaDate = new Date(0, 0, 0, hEntrada, mEntrada);
      const saidaDate = new Date(0, 0, 0, hSaida, mSaida);

      const diffHoras = (saidaDate - entradaDate) / (1000 * 60 * 60); // Diferença em horas
      return valorHora * diffHoras;
    } else if (modo === "diaria" && valorDiaria) {
      return valorDiaria; // Valor fixo da diária
    }
    return 0;
  };

  // Função para adicionar os dados ao Firestore
  const adicionarDados = async (e) => {
    e.preventDefault();

    if(modo == "hora"){
      if (!operador || !entrada || !saida || !placa || !data || (!valorHora && !valorDiaria)) {
        alert("Todos os campos são obrigatórios!");
        return;
      }
  
      try {
        // Usando a função formatarIDData para criar um ID personalizado
        const idDocumento = formatarIDData(data); // Gerando o ID no formato dd-mm-aa
        const docRef = doc(db, "caminhoes", placa, "entradas", idDocumento);
        
        // Verificando se o documento já existe
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          alert("Registro com está data já foi cadastrado!");
          return; // Se o documento já existe, não adiciona o novo registro
        }
  
        // Caso o documento não exista, adiciona o novo
        await setDoc(docRef, {
          operador: operador,
          entrada: formatarData(data, entrada),
          saida: formatarData(data, saida),
          valorHora: valorHora, // Adiciona o valor calculado
          modo: modo, // Armazena o modo (hora ou diária)
        });
  
        alert("Dados adicionados com sucesso!");
        // Limpar os campos após adicionar
        setOperador("");
        setEntrada("");
        setSaida("");
        setData("");
        setValorHora("");
        setValorDiaria("");
      } catch (error) {
        console.error("Erro ao adicionar dados:", error);
        alert("Erro ao adicionar dados.");
      }
    } else {
      try {
        // Usando a função formatarIDData para criar um ID personalizado
        const idDocumento = formatarIDData(data); // Gerando o ID no formato dd-mm-aa
        const docRef = doc(db, "caminhoes", placa, "entradas", idDocumento);
        
        // Verificando se o documento já existe
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          alert("Registro com está data já foi cadastrado!");
          return; // Se o documento já existe, não adiciona o novo registro
        }
  
        // Caso o documento não exista, adiciona o novo
        await setDoc(docRef, {
          operador: operador,
          entrada: "diaria",
          saida: "diaria",
          valor: valorDiaria, // Adiciona o valor calculado
          modo: modo, // Armazena o modo (hora ou diária)
        });
  
        alert("Dados adicionados com sucesso!");
        // Limpar os campos após adicionar
        setOperador("");
        setEntrada("");
        setSaida("");
        setData("");
        setValorHora("");
        setValorDiaria("");
      } catch (error) {
        console.error("Erro ao adicionar dados:", error);
        alert("Erro ao adicionar dados.");
      }
    };
  }
   

  return (
    <div>
      <h2>Adicionar Entrada e Saída</h2>
      <form onSubmit={adicionarDados}>

        <div>
          <label>Operador:</label>
          <input
            type="text"
            value={operador}
            onChange={(e) => setOperador(e.target.value)}
            placeholder="Nome do operador"
            required
          />
        </div>

        <div>
          <label>Data:</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Modo de Cálculo:</label>
          <select value={modo} onChange={(e) => setModo(e.target.value)}>
            <option value="hora">Por Hora</option>
            <option value="diaria">Diária</option>
          </select>
        </div>

        {
         modo == "hora" &&
         <div >
          <label>Entrada:</label>
          <input
            type="time"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            required
          />
        </div>
        }
        

        {
          modo == "hora" &&
          <div>
            <label>Saída:</label>
            <input
              type="time"
              value={saida}
              onChange={(e) => setSaida(e.target.value)}
              required
            />
          </div>
        }
        

      

        {modo === "hora" && (
          <div>
            <label>Valor por Hora:</label>
            <input
              type="number"
              value={valorHora}
              onChange={(e) => setValorHora(e.target.value)}
              placeholder="Valor por hora"
              required
            />
          </div>
        )}

        {modo === "diaria" && (
          <div>
            <label>Valor da Diária:</label>
            <input
              type="number"
              value={valorDiaria}
              onChange={(e) => setValorDiaria(e.target.value)}
              placeholder="Valor da diária"
              required
            />
          </div>
        )}

        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}

export default Adicionar;
