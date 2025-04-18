function generarCombinaciones(n) {
    const combinaciones = [];
    const totalFilas = Math.pow(2, n);
    for (let i = totalFilas - 1; i >= 0; i--) {
      const fila = i.toString(2).padStart(n, '0').split('').map(bit => parseInt(bit));
      combinaciones.push(fila);
    }
    return combinaciones;
  }
  
  let expresion = "";
  let combinaciones = [];
  let variables = [];
  let subexpresiones = [];
  
  function generarExpresionCompleja(vars) {
    const opsBinarios = ['∧', '∨', '⊕'];
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  
    if (vars.length >= 4) {
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
      return vars[0];
    }
  }
  
  function obtenerSubexpresiones(exp) {
    const regex = /\(([^()]+)\)/g;
    let match;
    const subexpresiones = [];
    while ((match = regex.exec(exp)) !== null) {
      if (!subexpresiones.includes(match[1])) {
        subexpresiones.push(match[1]);
      }
    }
    return subexpresiones;
  }
  
  function traducirExpresionParaEval(exp, fila, variables) {
    let jsExp = exp;
    variables.forEach((v, i) => {
      const valor = fila[i];
      const regex = new RegExp(`\\b${v}\\b`, 'g');
      jsExp = jsExp.replace(regex, valor);
    });
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
    variables = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
    combinaciones = generarCombinaciones(n);
    expresion = generarExpresionCompleja(variables);
    subexpresiones = obtenerSubexpresiones(expresion);
  
    document.getElementById('expresionLogica').innerText = `Expresión: ${expresion}`;
  
    const tabla = document.createElement('table');
    tabla.id = "tablaVerdad";
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
      tr.dataset.fila = i;
  
      fila.forEach(val => {
        const td = document.createElement('td');
        td.innerText = val === 1 ? 'V' : 'F';
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
    document.getElementById('auxiliaresContainer').innerHTML = '';
  
    const btn = document.createElement('button');
    btn.innerText = 'Mostrar cálculos auxiliares';
    btn.onclick = agregarColumnasAuxiliares;
    contenedor.appendChild(btn);
  }
  
  function agregarColumnasAuxiliares() {
    const tabla = document.getElementById('tablaVerdad');
    const header = tabla.rows[0];
  
    // Agrega encabezados para cada subexpresión
    subexpresiones.forEach((sub, idx) => {
      const th = document.createElement('th');
      th.innerText = `(${sub})`;
      th.classList.add('auxiliar');
      header.appendChild(th);
    });
  
    // Agrega inputs para cada fila
    for (let i = 1; i < tabla.rows.length; i++) {
      const fila = tabla.rows[i];
      subexpresiones.forEach((_, j) => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.dataset.index = `${i - 1}-${j}`;
        td.appendChild(input);
        fila.appendChild(td);
      });
    }
  
    // Deshabilita el botón después de agregar
    event.target.disabled = true;
  }
  
  function verificarRespuestas() {
    let correctos = 0;
  
    combinaciones.forEach((fila, i) => {
      const esperado = evaluarExpresion(expresion, fila, variables);
      const input = document.querySelector(`input[data-index="${i}"]`);
      const respuesta = input.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
      let valor;
      if (respuesta === 'v') {
        valor = 1;
      } else if (respuesta === 'f') {
        valor = 0;
      } else {
        input.style.backgroundColor = "#ffd966";
        return;
      }
  
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
  
  function mostrarAyuda() {
    const ayuda = document.getElementById('ayudaMemoria');
    ayuda.style.display = ayuda.style.display === 'block' ? 'none' : 'block';
  
    if (ayuda.innerHTML !== '') return;
  
    const tablaOperadores = `
    <h3>Tablas de Verdad</h3>
    <strong>¬ (Negación)</strong>
    <table>
      <tr><th>A</th><th>¬A</th></tr>
      <tr><td>V</td><td>F</td></tr>
      <tr><td>F</td><td>V</td></tr>
    </table>
    <strong>∧ (Y lógico)</strong>
    <table>
      <tr><th>A</th><th>B</th><th>A ∧ B</th></tr>
      <tr><td>V</td><td>V</td><td>V</td></tr>
      <tr><td>V</td><td>F</td><td>F</td></tr>
      <tr><td>F</td><td>V</td><td>F</td></tr>
      <tr><td>F</td><td>F</td><td>F</td></tr>
    </table>
    <strong>∨ (O lógico)</strong>
    <table>
      <tr><th>A</th><th>B</th><th>A ∨ B</th></tr>
      <tr><td>V</td><td>V</td><td>V</td></tr>
      <tr><td>V</td><td>F</td><td>V</td></tr>
      <tr><td>F</td><td>V</td><td>V</td></tr>
      <tr><td>F</td><td>F</td><td>F</td></tr>
    </table>
    <strong>⊕ (XOR)</strong>
    <table>
      <tr><th>A</th><th>B</th><th>A ⊕ B</th></tr>
      <tr><td>V</td><td>V</td><td>F</td></tr>
      <tr><td>V</td><td>F</td><td>V</td></tr>
      <tr><td>F</td><td>V</td><td>V</td></tr>
      <tr><td>F</td><td>F</td><td>F</td></tr>
    </table>`;
  
    ayuda.innerHTML = tablaOperadores;
  }
  