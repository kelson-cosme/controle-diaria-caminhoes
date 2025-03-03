import { useParams } from "react-router-dom";
import { db } from "../../componets/firebaseConfig/firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import Adicionar from "../adicionar/Adicionar";
import Editar from "../../assets/editar.png";
import Excluir from "../../assets/excluir.png";
import "./detalhes.css";

function Detalhes() {
  const { placa } = useParams();
  const [detalhes, setDetalhes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valorHora, setValorHora] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [registroEdicao, setRegistroEdicao] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState("0");
  const [refresh, setRefresh] = useState(false);



  function calcularTempoTotal(entradaTimestamp, saidaTimestamp) {
    if (!entradaTimestamp || !saidaTimestamp) return { tempoEmHoras: 0, tempoFormatado: "00:00:00" };

    const entrada = entradaTimestamp.toDate();
    const saida = saidaTimestamp.toDate();
    const diferencaMs = saida - entrada;

    if (diferencaMs < 0) return { tempoEmHoras: 0, tempoFormatado: "00:00:00" };

    const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencaMs % (1000 * 60)) / 1000);

    const tempoFormatado = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    const tempoEmHoras = horas + minutos / 60 + segundos / 3600;

    return { tempoEmHoras, tempoFormatado };
  }

  async function fetchData() {
    try {
        const entradasRef = collection(db, "caminhoes", placa, "entradas");
        const querySnapshot = await getDocs(entradasRef);

        const dados = querySnapshot.docs.map(doc => {
            const data = doc.data();

            const mesEntrada = parseInt(doc.id.split("-")[1]) - 1; // Obtém o mês do id (corrigindo o índice do mês)
            // Filtrar pelo mês selecionado
            if (mesSelecionado !== "" && mesEntrada !== Number(mesSelecionado)) {
              return null;
            }

            // Se for "hora", calcular tempo e valor normalmente
            if (data.modo === "hora") {
                const { tempoEmHoras, tempoFormatado } = calcularTempoTotal(data.entrada, data.saida);

                return {
                    id: doc.id,
                    operador: data.operador,
                    entrada: data.entrada,
                    saida: data.saida,
                    entradaFormatada: data.entrada?.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) || "",
                    saidaFormatada: data.saida?.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) || "",
                    tempoTotalFormatado: tempoFormatado,
                    tempoTotalEmHoras: tempoEmHoras,
                    valorHora: data.valorHora,
                    valorTotal: tempoEmHoras * data.valorHora, // Cálculo apenas para modo "hora"
                    modo: "hora"
                };
            }

            // Se for "diaria", apenas exibir os valores fixos, sem cálculo de tempo
            return {
                id: doc.id,
                operador: data.operador,
                entrada: "Diária",
                saida: "Diária",
                entradaFormatada: "Diária",
                saidaFormatada: "Diária",
                tempoTotalFormatado: "Diária",
                tempoTotalEmHoras: 0, 
                valorTotal: parseFloat(data.valor) || 0, // Pega o valor fixo do Firebase
                modo: "diaria",
                valorHora: data.valor
            };
        }).filter(dado => dado !== null); // Remove registros ignorados

        setDetalhes(dados);
    } catch (error) {
        console.error("Erro ao buscar os detalhes:", error);
    } finally {
        setLoading(false);
    }
}


  useEffect(() => {
    fetchData();
  }, [placa, valorHora, mesSelecionado, refresh]);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const abrirModalEdicao = (entrada) => {
    setRegistroEdicao(entrada);
    setShowEditModal(true);
};

const fecharModalEdicao = () => {
    setShowEditModal(false);
    setRegistroEdicao(null);
};

const salvarEdicao = async () => {
    if (!registroEdicao) return;

    try {
        const docRef = doc(db, "caminhoes", placa, "entradas", registroEdicao.id);

        // Se for "diária", só permite atualizar o valor
        if (registroEdicao.modo === "diaria") {
            await updateDoc(docRef, {
                valor: registroEdicao.valorTotal.toString() // Salva como string para evitar erro
            });
        } else {
            // Se for "hora", permite editar todos os campos
            await updateDoc(docRef, {
                operador: registroEdicao.operador,
                entrada: Timestamp.fromDate(new Date(`1970-01-01T${registroEdicao.entradaFormatada}:00`)), 
                saida: Timestamp.fromDate(new Date(`1970-01-01T${registroEdicao.saidaFormatada}:00`)),
                valorHora: registroEdicao.valorHora
              });
        }

        fecharModalEdicao();
        fetchData(); // Atualiza os dados após edição
    } catch (error) {
        console.error("Erro ao editar o registro:", error);
    }
};

  const excluirRegistro = async (id) => {
    // Exibe uma caixa de confirmação antes de excluir
    const confirmacao = window.confirm("Tem certeza que deseja excluir este registro?");
  
    if (confirmacao) {
      try {
        const docRef = doc(db, "caminhoes", placa, "entradas", id);
        await deleteDoc(docRef);
        alert(`Registro com ID: ${id} excluído com sucesso!`);
        setDetalhes(detalhes.filter((entrada) => entrada.id !== id));
      } catch (error) {
        console.error("Erro ao excluir o registro:", error);
      }
    } else {
      console.log("Exclusão cancelada");
    }
  };

  return (
    <>
      <h1>Detalhes do Caminhão</h1>
      <h2><strong>Placa:</strong> {placa}</h2>
      <select value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))}>
        <option value="0">Janeiro</option>
        <option value="1">Fevereiro</option>
        <option value="2">Março</option>
        <option value="3">Abril</option>
        <option value="4">Maio</option>
        <option value="5">Junho</option>
        <option value="6">Julho</option>
        <option value="7">Agosto</option>
        <option value="8">Setembro</option>
        <option value="9">Outubro</option>
        <option value="10">Novembro</option>
        <option value="11">Dezembro</option>
    </select>


      <ul className="tituloTabela">
        <li><h3>Data</h3></li>
        <li><h3>Operador</h3></li>
        <li><h3>Entrada</h3></li>
        <li><h3>Saída</h3></li>
        <li><h3>Tempo Total</h3></li>
        <li><h3>Valor H/diaria</h3></li>
        <li><h3>Total</h3></li>
        <li style={{width: "30px"}}></li>
        <li style={{width: "30px"}}></li>

      </ul>
      {loading ? (
        <p>Carregando...</p>
      ) : detalhes.length > 0 ? (
        <div className="dadosEntradas">
          <ul>
            {detalhes.map((entrada) => (
              <li key={entrada.id}>
                <p>{entrada.id}</p>
                <p>{entrada.operador}</p>
                <p>{entrada.entradaFormatada}</p>
                <p>{entrada.saidaFormatada}</p>
                <p>{entrada.tempoTotalFormatado}</p>
                <p>R$ {entrada.valorHora}</p>
                <p>R$ {entrada.valorTotal.toFixed(2)}</p>
                <img style={{cursor:"pointer", margin:"5px"}} width={"20px"} height={"20px"} src={Editar} alt="Editar" onClick={() => abrirModalEdicao(entrada)} />
                <img style={{cursor:"pointer", margin:"5px"}} width={"20px"} height={"20px"} src={Excluir} alt="Excluir" onClick={() => excluirRegistro(entrada.id)} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Nenhuma entrada registrada.</p>
      )}

      <button onClick={openModal}>Adicionar Registro</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeModal}>X</button>
            <Adicionar placa={placa} refresh={setRefresh} />
          </div>
        </div>
      )}

{showEditModal && (
  <div className="modal">
    <div className="modal-content">
      <button className="close" onClick={fecharModalEdicao}>X</button>
      <h2>Editar Registro</h2>

      <form>
        {registroEdicao.modo === "hora" ? (
          <>
            <div>
              <label>Operador:</label>
              <input 
                type="text" 
                value={registroEdicao.operador} 
                onChange={(e) => setRegistroEdicao({ ...registroEdicao, operador: e.target.value })} 
              />
            </div>

            <div>
              <label>Entrada:</label>
              <input 
                type="time" 
                value={registroEdicao.entradaFormatada} 
                onChange={(e) => setRegistroEdicao({ ...registroEdicao, entradaFormatada: e.target.value })} 
              />
            </div>

            <div>
              <label>Saída:</label>
              <input 
                type="time" 
                value={registroEdicao.saidaFormatada} 
                onChange={(e) => setRegistroEdicao({ ...registroEdicao, saidaFormatada: e.target.value })} 
              />
            </div>

            <div>
              <label>Valor Hora:</label>
              <input 
                type="number" 
                value={registroEdicao.valorHora} 
                onChange={(e) => setRegistroEdicao({ ...registroEdicao, valorHora: e.target.value })} 
              />
            </div>
          </>
        ) : (
          // Apenas exibe o campo de valor para modo "diária"
          <div>
            <label>Valor da Diária:</label>
            <input 
              type="number" 
              value={registroEdicao.valorTotal} 
              onChange={(e) => setRegistroEdicao({ ...registroEdicao, valorTotal: e.target.value })} 
            />
          </div>
        )}
      </form>

      <button onClick={salvarEdicao}>Salvar</button>
    </div>
  </div>
)}
    </>
  );
}

export default Detalhes;
