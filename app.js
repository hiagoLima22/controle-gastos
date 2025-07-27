import { db } from "./firebase-config.js";
import {
  collection, addDoc, getDocs, query, where, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const despesaForm = document.getElementById("despesaForm");
const receitaInput = document.getElementById("receita");
const salvarReceitaBtn = document.getElementById("salvarReceita");
const listaDespesas = document.getElementById("listaDespesas");
const saldoDiv = document.getElementById("saldo");
const mesResumo = document.getElementById("mesResumo");
const verResumoBtn = document.getElementById("verResumo");

let receitaMensal = 0;

salvarReceitaBtn.addEventListener("click", () => {
  receitaMensal = parseFloat(receitaInput.value) || 0;
  alert("Receita salva: R$" + receitaMensal);
});

despesaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  const mes = document.getElementById("mes").value;
  const cartao = document.getElementById("cartao").value || "";

  if (!nome || !valor || !mes) {
    alert("Preencha todos os campos!");
    return;
  }

  if (tipo === "fixa") {
    const meses = [
      "janeiro","fevereiro","marco","abril","maio","junho",
      "julho","agosto","setembro","outubro","novembro","dezembro"
    ];
    for (let m of meses) {
      await addDoc(collection(db, "gastos"), { nome, valor, tipo, mes: m, cartao });
    }
  } else {
    await addDoc(collection(db, "gastos"), { nome, valor, tipo, mes, cartao });
  }

  alert("Despesa adicionada!");
  despesaForm.reset();
});

verResumoBtn.addEventListener("click", async () => {
  const mes = mesResumo.value;
  if (!mes) {
    alert("Escolha um mês!");
    return;
  }

  listaDespesas.innerHTML = "";
  let total = 0;

  const q = query(collection(db, "gastos"), where("mes", "==", mes));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    total += data.valor;

    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${data.nome}</strong> - R$${data.valor} (${data.tipo}) [${data.cartao || "Sem cartão"}]
      <button class="delete" data-id="${docSnap.id}">Excluir</button>
    `;
    listaDespesas.appendChild(div);
  });

  saldoDiv.innerHTML = `<h3>Saldo: R$${(receitaMensal - total).toFixed(2)}</h3>`;
});

listaDespesas.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "gastos", id));
    alert("Despesa excluída!");
    e.target.parentElement.remove();
  }
});