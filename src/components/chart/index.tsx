import { db } from "../../componets/firebaseConfig/firebaseConfig";
import { useParams } from "react-router-dom";
import { collection } from "firebase/firestore"; // Importando corretamente
import { Timestamp, onSnapshot } from "firebase/firestore";

import { useEffect, useState } from "react";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

 
const chartConfig = {
  desktop: {
    label: "Pago",
    color: "#598f4b",
  },
  mobile: {
    label: "Não Pago",
    color: "#ed6263",
  },
} satisfies ChartConfig


function ChartOverview() {
    const { placa } = useParams();

    const [dadosGraficos, setDadosGraficos] = useState()

    const chartData = [
        { month: "Janeiro", pago: dadosGraficos?.janeiro?.pagamentoTrue || 0, naoPago:  dadosGraficos?.janeiro?.pagamentoFalse },
        { month: "Fevereiro", pago: dadosGraficos?.fevereiro?.pagamentoTrue, naoPago:  dadosGraficos?.fevereiro?.pagamentoFalse },
        { month: "Março", pago: dadosGraficos?.marco?.pagamentoTrue, naoPago:  dadosGraficos?.marco?.pagamentoFalse },
        { month: "Abril", pago: dadosGraficos?.abril?.pagamentoTrue, naoPago:  dadosGraficos?.abril?.pagamentoFalse },
        { month: "Maio", pago: dadosGraficos?.maio?.pagamentoTrue, naoPago:  dadosGraficos?.maio?.pagamentoFalse},
        { month: "Junho", pago: dadosGraficos?.junho?.pagamentoTrue, naoPago:  dadosGraficos?.junho?.pagamentoFalse},
        { month: "Julho", pago: dadosGraficos?.junho?.pagamentoTrue, naoPago:  dadosGraficos?.junho?.pagamentoFalse},
        { month: "Agosto", pago: dadosGraficos?.agosto?.pagamentoTrue, naoPago:  dadosGraficos?.agosto?.pagamentoFalse},
        { month: "Setembro", pago: dadosGraficos?.setembro?.pagamentoTrue, naoPago:  dadosGraficos?.setembro?.pagamentoFalse},
        { month: "Outubro", pago: dadosGraficos?.outubro?.pagamentoTrue, naoPago:  dadosGraficos?.outubro?.pagamentoFalse},
        { month: "Novembro", pago: dadosGraficos?.novembro?.pagamentoTrue, naoPago:  dadosGraficos?.novembro?.pagamentoFalse},
        { month: "Dezembro", pago: dadosGraficos?.dezembro?.pagamentoTrue, naoPago:  dadosGraficos?.dezembro?.pagamentoFalse},

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
        if (!placa) return;
    
        const entradasRef = collection(db, "caminhoes", placa, "entradas");
    
        // Escuta mudanças em tempo real
        const unsubscribe = onSnapshot(entradasRef, (querySnapshot) => {
            try {
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
                        modo: "diaria",
                        valorHora: data.valor,
                        pagamento: data.pagamento
                    };
                });
    
                console.log("🔥 Dados atualizados na coleção:", dados);
    
                // Organizar os dados por mês
                const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    
                const dadosPorMes = dados.reduce((acc, item) => {
                    const data = item.id.split("-");
                    const mes = meses[parseInt(data[1], 10) - 1];
    
                    const mesAno = `${mes}`; 
    
                    if (!acc[mesAno]) {
                        acc[mesAno] = {
                            dados: [],
                            pagamentoTrue: 0,
                            pagamentoFalse: 0,
                        };
                    }
    
                    acc[mesAno].dados.push(item);
    
                    if (item.pagamento === true) {
                        acc[mesAno].pagamentoTrue += parseFloat(item.valorTotal.toFixed(2));
                    } else if (item.pagamento === false) {
                        acc[mesAno].pagamentoFalse += parseFloat(item.valorTotal.toFixed(2));
                    }
    
                    return acc;
                }, {});
    
                Object.keys(dadosPorMes).forEach(mesAno => {
                    dadosPorMes[mesAno].pagamentoTrue = dadosPorMes[mesAno].pagamentoTrue.toFixed(2);
                    dadosPorMes[mesAno].pagamentoFalse = dadosPorMes[mesAno].pagamentoFalse.toFixed(2);
                });
    
                // console.log("📊 Dados organizados por mês:", dadosPorMes);
                setDadosGraficos(dadosPorMes)
    
            } catch (error) {
                console.error("❌ Erro ao buscar os detalhes:", error);
            } finally {
            }
        });
    
        // Cleanup: Para evitar múltiplas assinaturas ao desmontar o componente
        return () => unsubscribe();
    }, [placa]);
    
    
    
    return (
        <div className="w-full flex justify-center items-center ">

            {dadosGraficos && console.log(dadosGraficos.abril.pagamentoTrue)}

            <ChartContainer config={chartConfig} className="sm:w-1/2 max-h-[400px] w-full ">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false} 
                        tickFormatter={(value) => value.slice(0, 3)} //letra
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="pago" fill="var(--color-desktop)" radius={4} />
                    <Bar dataKey="naoPago" fill="var(--color-mobile)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
export default ChartOverview