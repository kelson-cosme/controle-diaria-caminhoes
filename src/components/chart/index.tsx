import { db } from "../../componets/firebaseConfig/firebaseConfig";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore"; // Importando corretamente

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

    const { placa } = useParams();

    const chartData = [
        { month: "January", desktop: 250, mobile: 80 },
        { month: "February", desktop: 125, mobile: 200 },
        { month: "March", desktop: 237, mobile: 120 },
        { month: "April", desktop: 73, mobile: 190 },
        { month: "May", desktop: 209, mobile: 130 },
        { month: "June", desktop: 214, mobile: 140 },
      ]

      
      useEffect(() => {
        async function fetchData() {
            try {
                const entradasRef = collection(db, "caminhoes", placa, "entradas");
                const querySnapshot = await getDocs(entradasRef);
    
                const dados = querySnapshot.docs.map(doc => ({
                    id: doc.id, // Nome do documento (ex: "02-03-25")
                    ...doc.data() // Dados do documento
                }));
    
                // Array com os nomes dos meses
                const meses = [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ];
    
                // Organizar os dados por mês
                const dadosPorMes = dados.reduce((acc, item) => {
                    const data = item.id.split("-"); // Assumindo formato dd-mm-yy
                    const mes = meses[parseInt(data[1], 10) - 1]; // Converter o número do mês para o nome
    
                    const mesAno = `${mes}`; // Formato "Mês de Ano" (ex: "Março de 2025")
    
                    if (!acc[mesAno]) {
                        acc[mesAno] = [];
                    }
                    acc[mesAno].push(item); // Adiciona o item ao mês correspondente
    
                    return acc;
                }, {});
    
                console.log("Dados organizados por mês:", dadosPorMes);
                
            } catch (error) {
                console.error("Erro ao buscar os detalhes:", error);
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