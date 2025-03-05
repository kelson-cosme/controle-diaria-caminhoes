import { useState } from "react";
import { db } from "../../componets/firebaseConfig/firebaseConfig.ts";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./Adicionar.css";

function Adicionar({ placa, refresh }) {
  const [operador, setOperador] = useState("");
  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");
  const [data, setData] = useState("");
  const [modo, setModo] = useState("hora");
  const [valorHora, setValorHora] = useState("");
  const [valorDiaria, setValorDiaria] = useState("");
  const [loading, setLoading] = useState(false); // Estado para loading
  const [pagamento, setPagamento] = useState(true)

  const formatarIDData = (dataEscolhida) => {
    const [ano, mes, dia] = dataEscolhida.split("-");
    return `${dia}-${mes}-${ano.substring(2)}`;
  };

  const adicionarDados = async (e) => {
    e.preventDefault();

    if (!operador || !data || (!valorHora && !valorDiaria)) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    setLoading(true); // Inicia o loading

    try {
      const idDocumento = formatarIDData(data);
      const docRef = doc(db, "caminhoes", placa, "entradas", idDocumento);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        alert("Registro com esta data já foi cadastrado!");
        setLoading(false);
        return;
      }

      await setDoc(docRef, {
        operador,
        entrada: modo === "hora" ? entrada : "diaria",
        saida: modo === "hora" ? saida : "diaria",
        valor: modo === "hora" ? valorHora : valorDiaria,
        modo,
        pagamento: modo === "hora" ? pagamento : pagamento,
      });

      alert("Dados adicionados com sucesso!");
      refresh((prev) => !prev);
      setOperador("");
      setEntrada("");
      setSaida("");
      setData("");
      setValorHora("");
      setValorDiaria("");
    } catch (error) {
      console.error("Erro ao adicionar dados:", error);
      alert("Erro ao adicionar dados.");
    } finally {
      setLoading(false); // Finaliza o loading
    }
  };

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

        {modo === "hora" && (
          <>
            <div>
              <label>Entrada:</label>
              <input
                type="time"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Saída:</label>
              <input
                type="time"
                value={saida}
                onChange={(e) => setSaida(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Valor por Hora:</label>
              <input
                type="number"
                value={valorHora}
                onChange={(e) => setValorHora(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {modo === "diaria" && (
          <div>
            <label>Valor da Diária:</label>
            <input
              type="number"
              value={valorDiaria}
              onChange={(e) => setValorDiaria(e.target.value)}
              required
            />
          </div>
        )}

            <div>
              <label>Pago: </label> <br />
              <select value={pagamento} 
                onChange={(e) => setPagamento(e.target.value === "true")}
              >
                <option value={true}>Sim</option>
                <option value={false}>Não</option>
              </select>
            </div>  

        <button type="submit" disabled={loading}>
          {loading ? "Aguarde..." : "Adicionar"}
        </button>
      </form>
    </div>
  );
}

export default Adicionar;
