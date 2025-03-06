import { db } from "../../componets/firebaseConfig/firebaseConfig";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore"; // Importando corretamente
import { Timestamp } from "firebase/firestore";

import { useEffect, useState } from "react";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


 
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig


function ChartOverview() {

    const [dadosMensais, setDadosMensais] = useState({});
    const [detalhes, setDetalhes] = useState()
    const [loading, setLoading] = useState(true);


    const { placa } = useParams();

    const chartData = [
        { month: "January", desktop: 250, mobile: 80 },
        { month: "February", desktop: 125, mobile: 200 },
        { month: "March", desktop: 237, mobile: 120 },
        { month: "April", desktop: 73, mobile: 190 },
        { month: "May", desktop: 209, mobile: 130 },
        { month: "June", desktop: 214, mobile: 140 },
      ]

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
      
      useEffect(() => {
          async function fetchData() {
            
            try {
              const entradasRef = collection(db, "caminhoes", placa, "entradas");
              const querySnapshot = await getDocs(entradasRef);
        
              const dados = querySnapshot.docs.map(doc => {
                const data = doc.data();

        
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
                        valorTotal: parseFloat(parseFloat(data.valor).toFixed(2)),
                        // valorTotal: parseFloat(data.valor) || 0, // Pega o valor fixo do Firebase
                        modo: "diaria",
                        valorHora: data.valor,
                        pagamento: data.pagamento
                    };
              })
              console.log(dados)

                // Array com os nomes dos meses
                const meses = [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ];
    
                // Organizar os dados por mês e calcular a somatória
                const dadosPorMes = dados.reduce((acc, item) => {
                    const data = item.id.split("-"); // Assumindo formato dd-mm-yy
                    const mes = meses[parseInt(data[1], 10) - 1]; // Converter o número do mês para o nome
    
                    const mesAno = `${mes}`; // Formato "Mês de Ano" (ex: "Março de 2025")
    
                    // Inicializa o objeto de agrupamento, se necessário
                    if (!acc[mesAno]) {
                        acc[mesAno] = {
                            dados: [],
                            pagamentoTrue: 0, // Somatória para pagamento verdadeiro
                            pagamentoFalse: 0, // Somatória para pagamento falso
                        };
                    }
    
                    // Adiciona o item ao mês correspondente
                    acc[mesAno].dados.push(item);
    
                    // Verifica se o pagamento foi realizado e soma os valores
                    if (item.pagamento === true) {
                        acc[mesAno].pagamentoTrue += parseFloat(item.valorTotal.toFixed(2)); // Arredonda para 2 casas decimais
                    } else if (item.pagamento === false) {
                        acc[mesAno].pagamentoFalse += parseFloat(item.valorTotal.toFixed(2)); // Arredonda para 2 casas decimais
                    }
    
                    return acc;
                }, {});

                // Garantir que os valores sejam sempre exibidos com duas casas decimais
                    Object.keys(dadosPorMes).forEach(mesAno => {
                        dadosPorMes[mesAno].pagamentoTrue = dadosPorMes[mesAno].pagamentoTrue.toFixed(2);
                        dadosPorMes[mesAno].pagamentoFalse = dadosPorMes[mesAno].pagamentoFalse.toFixed(2);
                    });
    
                console.log("Dados organizados por mês:", dadosPorMes);

            } catch (error) {
              console.error("Erro ao buscar os detalhes:", error);
            } finally {
              setLoading(false);
            }
          }
       
          
        if (placa) {
            fetchData();
        }
    }, [placa]);
    
    
    return (
        <div className="w-full flex justify-center items-center ">
            <ChartContainer config={chartConfig} className="max-h-[400px] w-1/2 ">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
export default ChartOverview