const btnLoad = document.getElementById("btnLoad");
const file = document.getElementById("file");
const labelFile = document.getElementById("labelFile");
const cardResult = document.getElementById("cardResult");
const table = document.getElementById("table");
const result = document.getElementById("result");

var fileCut = [];
var inputMaxWidth = 6000;
var thickness = 0.5;
var cutResult = [];
var noCuts = [];

//resultados
var totalGroup = 0;
var totalResto = 0;
var totalMetros = 0;
var totalMilim = 0;
var porcentResto = 0;

file.addEventListener("change", function (e) {
  if (file.value != "") {
    labelFile.innerHTML = file.value;
  } else {
    labelFile.innerHTML = `
    Ingrese archivo
    <img src="icons/upload.svg" alt="">
    `;
  }
});

btnLoad.addEventListener("click", (e) => {
  e.preventDefault();
  fileCut = [];
  reset();
  inputMaxWidth = document.getElementById("inputMaxWidth").value;
  thickness = document.getElementById("inputThickness").value;

  if (file.value != "") {
    readXlsxFile(file.files[0]).then(function (data) {
      //se ordena de mayor a menor
      data.sort(function (a, b) {
        return b[1] - a[1];
      });
      //seagrega un nuevo array al fileCut
      for (i in data) {
        for (j = 0; j < data[i][0]; j++) {
          if (data[i][2]) {
            fileCut.push([data[i][1], data[i][2]]);
          } else {
            fileCut.push([data[i][1], "sin descripcion"]);
          }
        }
      }
      while (fileCut.length > 0) {
        groupCuts();
      }
      console.log(cutResult);
      console.log(noCuts);

      calcResult();

      insertHtml();
    });
  }
});

function groupCuts() {
  var groupCut = [];
  var maxWidth = inputMaxWidth;
  var spliceCut = [];

  //se elimina los cortes que no cumplen con la condicion de que la longitud sea menor o igual a la longitud maxima
  for (i in fileCut) {
    if (fileCut[i][0] > maxWidth) {
      noCuts.push(fileCut[i]);
      fileCut.splice(i, 1);
    }
  }

  for (i in fileCut) {
    if (fileCut[i][0] <= maxWidth) {
      groupCut.push(fileCut[i]);
      maxWidth -= fileCut[i][0];
      if (maxWidth > thickness) {
        maxWidth -= thickness;
      }
      spliceCut.push(i);
    }
  }
  if (groupCut.length > 0) {
    var currentGroup = new Object();
    currentGroup.cortes = groupCut;
    currentGroup.resto = maxWidth;

    cutResult.push(currentGroup);
  }

  //oredenar los cortes a borrar de mayor a menor
  //esto es porque sino se borra el primer corte y se modifican los index de los proximos cortes
  spliceCut.sort(function (a, b) {
    return b - a;
  });
  for (i in spliceCut) {
    fileCut.splice(spliceCut[i], 1);
  }
}

function calcResult() {
  //resultados

  totalGroup = cutResult.length;

  totalResto = cutResult.reduce((acc, group) => {
    return acc + group.resto;
  }, 0);

  totalMetros = totalGroup * (inputMaxWidth / 1000);

  totalMilim = totalMetros * 1000;

  porcentResto = (totalResto / totalMetros) * 100;
}

function reset() {
  cutResult = [];
  noCuts = [];
  cardResult.innerHTML = "";
  result.innerHTML = "";
}

function insertHtml() {
  cardResult.innerHTML = `
   <div class="card">
                    <h5>
                        Perfiles
                    </h5>
                    <p>
                        ${totalGroup}
                    </p>
                </div>
                <div class="card">
                    <h5>
                        Metros
                    </h5>
                    <p>
                        ${totalMetros}m
                    </p>
                </div>
                <div class="card">
                    <h5>
                        Restante
                    </h5>
                    <p>
                        ${(totalResto / 1000).toFixed(2)}m
                    </p>
                </div>
                <div class="card">
                    <h5>
                        Desperdicio
                    </h5>
                    <p>
                        ${(porcentResto / 1000).toFixed(2)}%
                    </p>
                </div>
  `;
  insertTable1();
}

function insertTable1() {
  result.innerHTML = `
  <button onclick="insertTable2()">Cambiar vista</button>
  <table>
  <thead>
      <tr>
          <th>
              #
          </th>
          <th>
              Corte (mm)
          </th>
          <th>
              Resto (mm)
          </th>

      </tr>
  </thead>
  <tbody>
    ${cutResult
      .map(
        (group, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${group.cortes.map((cut) => cut[0]).join(" ")}</td>
        <td>${group.resto}
        <div class="graph">
          <div style="width: ${
            (group.resto * 100) / inputMaxWidth
          }%" class="graph-bar"></div>
        </div>
        </td>
    </tr>
    `
      )
      .join("")}
   </tbody>
   <br>
   </table>
   <br>
   `;

  if (noCuts.length > 0) {
    result.innerHTML += `
    <h5>
        Cortes no aplicados
    </h5>
    <p>
        ${noCuts.map((cut) => cut[0]).join(" ")}
    </p>
    
    `;
  }
}

function insertTable2() {
  result.innerHTML = `
    <button onclick="insertTable1()">Cambiar vista</button>
  <table>
  <thead>
      <tr>
          <th>
              #
          </th>
          <th>
              Corte (mm)
          </th>
          <th>
          Descripcion
          </th>

      </tr>
  </thead>
  <tbody>
    ${cutResult
      .map(
        (group, index) => `
    ${group.cortes
      .map(
        (cut) => `
    <tr>
        <td>${index + 1}</td>
        <td>${cut[0]}</td>
        <td style="white-space: nowrap">${cut[1]}</td>
    </tr>
    `
      )
      .join("")}

    `
      )
      .join("<tr><td></td><td></td><td></td></tr>")}
   </tbody>
   <br>
   </table>
   <br>
   `;

  if (noCuts.length > 0) {
    result.innerHTML += `
    <h5>
        Cortes no aplicados
    </h5>
    <p>
        ${noCuts.map((cut) => cut[0]).join(" ")}
    </p>
    
    `;
  }
}
