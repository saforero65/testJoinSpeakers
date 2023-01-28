const trackCompleto = document.getElementById("trackCompleto");
const infoSRT = document.getElementById("infoSRT");
const contenedor_infoSRT = document.getElementById("contenedor-infoSRT");
const contenedor_infoSpeaker = document.getElementById(
  "contenedor-infoSpeaker"
);

trackCompleto.addEventListener("click", function () {
  contenedor_infoSRT.style.display = "block";
  //cargar archivo json
  fetch("/trackDataSRT.json")
    .then((response) => response.json())
    .then((data) => {
      mosrarDatos(data);
    });
});
mosrarDatos = (data) => {
  const totalSegmentos = data.totalSegmentos;
  const track = data.track;
  const totalSpeakers = track.length;
  const listSpeakers = track.map((speaker) => speaker.speaker + " ");

  const fragmento = document.createDocumentFragment();
  listSpeakers.forEach((valor) => {
    const boton = document.createElement("button");
    //assignamos un id a cada boton
    boton.setAttribute("id", valor);
    boton.innerHTML = valor;
    fragmento.appendChild(boton);
  });

  infoSRT.innerHTML = `   
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Total de segmentos SRT: ${totalSegmentos}</h5>
            <h5 class="card-title">Total de speakers: ${totalSpeakers}</h5>
            <div class="card-title">Lista de speakers: <div id="lista"></div></div>
        </div>
    </div>
    `;
  const lista = document.getElementById("lista");
  lista.appendChild(fragmento);

  //agregamos un evento click a cada boton
  const botones = document.querySelectorAll("#lista button");
  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      console.log(boton.id);
      mostrarDatosSpeaker(boton.id);
    });
  });
};
mostrarDatosSpeaker = (id) => {
  fetch("/trackDataSRT.json")
    .then((response) => response.json())
    .then((data) => {
      data.track.map((speaker) => {
        const clickId = id.trim();

        if (speaker.speaker == clickId) {
          contenedor_infoSpeaker.style.display = "block";
          const talento = speaker.speaker;
          const totalSegmentos = speaker.totalSegmentos;
          const segmentos = speaker.segmentos;
          console.log(segmentos);
          const fragmento = document.createDocumentFragment();
          segmentos.forEach((valor) => {
            const divSRT = document.createElement("div");
            divSRT.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">id: ${valor.id}</h5>
                    <h5 class="card-title">start: ${valor.startTime}</h5>
                    <h5 class="card-title">start: ${valor.endTime}</h5>
                    <h5 class="card-title">text: ${valor.text}</h5>
                </div>
            </div>
            `;
            fragmento.appendChild(divSRT);
          });

          contenedor_infoSpeaker.innerHTML = `
            <div class="card">
                <div class="card-body">
                <div style="display:flex;align-items: center;">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">SPEAKER: <span id="speaker">${talento}</span> TOTAL SEGMENTOS: <span>${totalSegmentos} </span> </h5>
                <a class="btn editar" id="editar-${talento}">Editar</a>
                <a class="btn descargar" id="descargar-${talento}">Descargar</a>
                </div>
                
                
                <div class="card-title"> <div id="segmentos"></div></div>
                </div>
            </div>
            `;
          const segmentosId = document.getElementById("segmentos");
          segmentosId.appendChild(fragmento);
          const editarSpeaker = document.getElementById("speaker");

          const editar = document.getElementById(`editar-${talento}`);
          const descargar = document.getElementById(`descargar-${talento}`);
          editar.addEventListener("click", () => {
            const nombre = prompt("Ingrese el nuevo nombre del speaker");
            editarArchivoJSON(talento, nombre);
            editarSpeaker.innerHTML = nombre;
          });
          descargar.addEventListener("click", () => {
            descargarSRT(talento);
          });
        }
      });
    });
};
editarArchivoJSON = (id, nombre) => {
  console.log(id);
  fetch("/trackDataSRT.json")
    .then((response) => response.json())
    .then((data) => {
      data.track.map((speaker) => {
        if (speaker.speaker == id) {
          speaker.speaker = nombre;
          speaker.segmentos.map((segmento) => {
            segmento.text = segmento.text.replace(id, nombre);
          });
          console.log(speaker);
        }
      });
      const json = JSON.stringify(data);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = "trackDataSRT.json";
      a.click();
    });
};
descargarSRT = (speaker) => {
  fetch("/trackDataSRT.json")
    .then((response) => response.json())
    .then((data) => {
      let srt = "";
      data.track.map((speakerData) => {
        if (speakerData.speaker == speaker) {
          const segmentos = speakerData.segmentos;

          segmentos.map((segmento) => {
            srt += `\n${segmento.id} \n${segmento.startTime} --> ${segmento.endTime}\n${segmento.text} \n
            `;
          });
        }
      });
      const blob = new Blob([srt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = `${speaker}.srt`;
      a.click();
    });
};
