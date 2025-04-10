function generarCombinaciones(n) {
    const combinaciones = [];
    const totalFilas = Math.pow(2, n);
    for (let i = 0; i < totalFilas; i++) {
      const fila = i.toString(2).padStart(n, '0').split('').map(bit => parseInt(bit));
      combinaciones.push(fila);
    }
    return combinaciones;
  }
  
  let expresion = "";
  let combinaciones = [];
  let variables = [];
  
  function generarExpresionCompleja(vars) {
    const opsBinarios = ['∧', '∨', '⊕'];
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  
    if (vars.length >= 4) {
      // Dividir en dos grupos de 2 variables
      const mezcladas = shuffle(vars);
      const [v1, v2, v3, v4] = mezcladas;
  
      const op1 = opsBinarios[Math.floor(Math.random() * opsBinarios.length)];
      const op2 = opsBinarios[Math.floor(Math.random() * opsBinarios.length)];
      const opFinal = opsBinarios[Math.floor(Math.random() * opsBinarios.length)];
  
      const expr1 = `( ${v1} ${op1} ${v2} )`;
      const expr2 = `( ${v3} ${op2} ${v4} )`;
  
      return `${expr1} ${opFinal} ${expr2}`;
    } else if (vars.length === 3) {
      const [v1, v2, v3] = shuffle(vars);
      const op1 = opsBinarios[Math.floor(Math.random() * opsBinarios.length)];
      const op2 = opsBinarios[Math.floor(Math.random() * opsBinarios.length)];
  
      return `( ${v1} ${op1} ${v2} ) ${op2} ${v3}`;
    } else if (vars.length === 2) {
      const [v1, v2] = shuffle(vars);
      const op1 = opsBinarios[Math.floor(Math.random() * opsBinarios.length)];
      return `${v1} ${op1} ${v2}`;
    } else {
      return vars[0]; // Solo una variable
    }
  }
  
  
  function traducirExpresionParaEval(exp, fila, variables) {
    let jsExp = exp;
  
    // Reemplazar variables con valores
    variables.forEach((v, i) => {
      const valor = fila[i];
      const regex = new RegExp(`\\b${v}\\b`, 'g');
      jsExp = jsExp.replace(regex, valor);
    });
  
    // Operadores
    jsExp = jsExp
      .replace(/¬(\d)/g, (_, v) => `!${v}`)
      .replace(/∧/g, '&&')
      .replace(/∨/g, '||')
      .replace(/⊕/g, '!=');
  
    return jsExp;
  }
  
  function evaluarExpresion(exp, fila, variables) {
    const jsExp = traducirExpresionParaEval(exp, fila, variables);
    try {
      return eval(jsExp) ? 1 : 0;
    } catch (e) {
      console.error("Error evaluando expresión:", jsExp);
      return 0;
    }
  }
  
  function generarTabla() {
    const n = parseInt(document.getElementById('numVars').value);
    variables = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i)); // ['A','B','C'...]
    combinaciones = generarCombinaciones(n);
    expresion = generarExpresionCompleja(variables);
  
    document.getElementById('expresionLogica').innerText = `Expresión: ${expresion}`;
  
    const tabla = document.createElement('table');
    const header = document.createElement('tr');
  
    variables.forEach(v => {
      const th = document.createElement('th');
      th.innerText = v;
      header.appendChild(th);
    });
  
    const thExpr = document.createElement('th');
    thExpr.innerText = expresion;
    header.appendChild(thExpr);
    tabla.appendChild(header);
  
    combinaciones.forEach((fila, i) => {
      const tr = document.createElement('tr');
      fila.forEach(val => {
        const td = document.createElement('td');
        td.innerText = val;
        tr.appendChild(td);
      });
  
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.dataset.index = i;
  
      const tdInput = document.createElement('td');
      tdInput.appendChild(input);
      tr.appendChild(tdInput);
  
      tabla.appendChild(tr);
    });
  
    const contenedor = document.getElementById('tablaContainer');
    contenedor.innerHTML = '';
    contenedor.appendChild(tabla);
  
    document.getElementById('resultado').innerText = '';
  }
  
  function verificarRespuestas() {
    let correctos = 0;
  
    combinaciones.forEach((fila, i) => {
      const esperado = evaluarExpresion(expresion, fila, variables);
      const input = document.querySelector(`input[data-index="${i}"]`);
      const valor = parseInt(input.value);
  
      if (valor === esperado) {
        input.style.backgroundColor = "#b2f7b2";
        correctos++;
      } else {
        input.style.backgroundColor = "#f7b2b2";
      }
    });
  
    document.getElementById('resultado').innerText =
      `Tuviste ${correctos} respuestas correctas de ${combinaciones.length}`;
  }
  