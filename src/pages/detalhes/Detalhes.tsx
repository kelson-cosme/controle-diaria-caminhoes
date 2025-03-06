import { useParams } from "react-router-dom";
import { db } from "../../componets/firebaseConfig/firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import Adicionar from "../adicionar/Adicionar";
import Editar from "../../assets/editar.png";
import Excluir from "../../assets/excluir.png";
import "./detalhes.css";

import ChartOverview from "@/components/chart";

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

    const entrada = entradaTimestamp?.toDate();
    const saida = saidaTimestamp?.toDate();
    if (!entrada || !saida) return { tempoEmHoras: 0, tempoFormatado: "00:00:00" };

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
    setLoading(true)
    
    try {
      const entradasRef = collection(db, "caminhoes", placa, "entradas");
      const querySnapshot = await getDocs(entradasRef);

      const dados = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const mesEntrada = parseInt(doc.id.split("-")[1]) - 1;
        if (mesSelecionado !== "" && mesEntrada !== Number(mesSelecionado))
          return null ;

          if (data.modo === "hora") {
            const entradaTimestamp = data.entrada ? Timestamp.fromDate(new Date(`1970-01-01T${data.entrada}:00`)) : null;
            const saidaTimestamp = data.saida ? Timestamp.fromDate(new Date(`1970-01-01T${data.saida}:00`)) : null;
            const { tempoEmHoras, tempoFormatado } = calcularTempoTotal(entradaTimestamp, saidaTimestamp);
    
            return {
              id: doc.id,
              operador: data.operador,
              entrada: data.entrada,
              saida: data.saida,
              entradaFormatada: data.entrada || "",
              saidaFormatada: data.saida || "",
              tempoTotalFormatado: tempoFormatado,
              tempoTotalEmHoras: tempoEmHoras,
              valorHora: data.valor,
              valorTotal: tempoEmHoras * data.valor,
              modo: "hora",
              pagamento: data.pagamento

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
                valorHora: data.valor,
                pagamento: data.pagamento
            };


      }).filter(dado => dado !== null);
      // console.log(dados)
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
                operador: registroEdicao.operador,
                valor: registroEdicao.valorTotal.toString(), // Salva como string para evitar erro
                pagamento: registroEdicao.pagamento

            });
        } else {
            // Se for "hora", permite editar todos os campos
            await updateDoc(docRef, {
              operador: registroEdicao.operador,
              entrada: registroEdicao.entradaFormatada, // Apenas "HH:mm"
              saida: registroEdicao.saidaFormatada,     // Apenas "HH:mm"
              valor: registroEdicao.valorHora,
              pagamento: registroEdicao.pagamento
            });
        }

        fecharModalEdicao();
        fetchData(); // Atualiza os dados após edição
        alert("Dados alterados com sucesso")
    } catch (error) {
        console.error("Erro ao editar o registro:", error);
    }
};

  const excluirRegistro = async (id) => {
    // Exibe uma caixa de confirmação antes de excluir
    const confirmacao = window.confirm(`Tem certeza que quer excluir o registro do dia: ${id}`);

    if (confirmacao) {
      try {
        const docRef = doc(db, "caminhoes", placa, "entradas", id);
        await deleteDoc(docRef);
        alert(`Registro com ID: ${id} excluído com sucesso!`);
        fecharModalEdicao();
        setDetalhes(detalhes.filter((entrada) => entrada.id !== id));
      } catch (error) {
        console.error("Erro ao excluir o registro:", error);
      }
    } else {
      console.log("Exclusão cancelada");
    }
  };

  return (
    <div className="corpoDetalhes">
      <h1 className="detalhesCaminhao font-bold text-2xl">Detalhes do Caminhão</h1>
      <h2 className="placa"><strong>Placa:</strong> {placa}</h2>

      <div className="flex">
        <h2 className="mes"> <strong> Escolha o Mês: </strong></h2>

        <select className="selecionar border-3 border-cyan-#919d7f rounded-sm" value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))}>
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
      </div>
      
     

      <ul className="tituloTabela">
        <li><h3>Data</h3></li>
        <li><h3>Operador</h3></li>
        <li><h3>Entrada</h3></li>
        <li><h3>Saída</h3></li>
        <li><h3>Tempo Total</h3></li>
        <li><h3>Valor H/diaria</h3></li>
        <li><h3>Total</h3></li>
      </ul>
      {loading ? (
        <p>Carregando...</p>
      ) : detalhes.length > 0 ? (
        <div className="dadosEntradas">
          <ul>
            {detalhes.map((entrada) => (
              <li onClick={() => abrirModalEdicao(entrada)} style={{ background: entrada.pagamento ? "#d5fac4" : "#fa504d", 
                          color: entrada.pagamento ? "black" : "#ffff"
                        }}
                        key={entrada.id}>
                <p>{entrada.id}</p>
                <p>{entrada.operador}</p>
                <p>{entrada.entradaFormatada}</p>
                <p>{entrada.saidaFormatada}</p>
                <p>{entrada.tempoTotalFormatado}</p>
                <p>R$ {entrada.valorHora}</p>
                <p>R$ {entrada.valorTotal.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Nenhuma entrada registrada.</p>
      )}

      <button className="modalAdicionar" onClick={openModal}>Adicionar Registro</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeModal}>X</button>
            <Adicionar placa={placa} close={setShowModal} refresh={setRefresh} />
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

                <div>
                  <label>Pago: </label>
                  <select value={registroEdicao.pagamento} name="" id="" 
                    onChange={(e) => setRegistroEdicao({...registroEdicao, pagamento: e.target.value === "true"})}
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>

                <img style={{cursor:"pointer", margin:"5px"}} width={"20px"} height={"20px"} src={Excluir} alt="Excluir" onClick={() => excluirRegistro(registroEdicao.id)} />

              </>
            ) : (
              // Apenas exibe o campo de valor para modo "diária"
              <div>

                <div>
                  <label>Operador:</label>
                  <input 
                    type="text" 
                    value={registroEdicao.operador} 
                    onChange={(e) => setRegistroEdicao({ ...registroEdicao, operador: e.target.value })} 
                  />
                </div>

                <label>Valor da Diária:</label>
                <input 
                  type="number" 
                  value={registroEdicao.valorTotal} 
                  onChange={(e) => setRegistroEdicao({ ...registroEdicao, valorTotal: e.target.value })} 
                />

                <div>
                  <label>Pago: </label>
                  <select value={registroEdicao.pagamento} name="" id="" 
                    onChange={(e) => setRegistroEdicao({...registroEdicao, pagamento: e.target.value === "true"})}
                  >
                    <option value={true}>Sim</option>
                    <option value={false}>Não</option>
                  </select>
                </div>
                <img style={{cursor:"pointer", margin:"5px"}} width={"20px"} height={"20px"} src={Excluir} alt="Excluir" onClick={() => console.log(excluirRegistro(registroEdicao.id))} />
              </div>


            )}
          </form>

          <button onClick={salvarEdicao}>Salvar</button>
        </div>
      </div>
    )}
    <ChartOverview/>

    </div>
  );
}

export default Detalhes;
