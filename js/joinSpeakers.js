const trackCompleto = document.getElementById("trackCompleto");
const contenedor_infoSRT = document.getElementById("contenedor-infoSRT");

trackCompleto.addEventListener("click", function () {
  //cargar archivo json
  fetch("/trackDataSRT.json")
    .then((response) => response.json())
    .then((data) => {
      mostrarSpeakers(data);
    });
});

mostrarSpeakers = (data) => {
  contenedor_infoSRT.style.display = "block";
  const track = data.track;
  const totalSpeakers = track.length;
  const listSpeakers = track.map((speaker) => speaker.speaker + " ");

  console.log(listSpeakers);
  console.log(totalSpeakers);
  console.log(track);

  //hacer checklist de speakers
  const fragmento = document.createDocumentFragment();
  listSpeakers.forEach((valor) => {
    const label = document.createElement("label");
    label.setAttribute("class", "checkbox-inline");
    label.innerHTML = `<input type="checkbox" value="${valor}" id="${valor}" />${valor}`;
    fragmento.appendChild(label);
  });
  contenedor_infoSRT.innerHTML = `
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Total de speakers: ${totalSpeakers}</h5>
            <div class="card-title">Lista de speakers: <div id="lista"></div></div>
            <a id="unir">Unir Speakers</a>
        </div>
    </div>
    `;
  const lista = document.getElementById("lista");
  lista.appendChild(fragmento);

  //agregamos un evento click a cada inpt ckeckbox
  const checkboxes = document.querySelectorAll("#lista input");
  const listCheckboxes = [];
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("click", () => {
      //si esta en la lista, no agregarlo
      if (listCheckboxes.includes(checkbox.id)) {
      } else {
        listCheckboxes.push(checkbox.id);
      }

      //si no esta check el checkbox, eliminarlo de la lista
      if (checkbox.checked == false) {
        const index = listCheckboxes.indexOf(checkbox.id);
        if (index > -1) {
          listCheckboxes.splice(index, 1);
        }
      }
    });
  });
  const unir = document.getElementById("unir");
  unir.addEventListener("click", () => {
    const nameSpeaker = prompt("Nombre del speaker a unir");
    joinSpeakers(listCheckboxes, nameSpeaker);
  });
};

joinSpeakers = (listCheckboxes, nameSpeaker) => {
  fetch("/trackDataSRT.json")
    .then((response) => response.json())
    .then((data) => {
      const track = data.track;

      let joinSpeaker = [];
      track.map((speaker) => {
        listCheckboxes.map((checkbox) => {
          if (checkbox.trim() == speaker.speaker) {
            speaker.segmentos.map((segmento) => {
              segmento.speaker = nameSpeaker;
              segmento.text = segmento.text.replace(
                speaker.speaker,
                nameSpeaker
              );
            });
            joinSpeaker.push(speaker.segmentos);
          }
        });
        //unir arreglos de segmentos
      });
      const joinSegmentos = [].concat.apply([], joinSpeaker);

      converToSRT(joinSegmentos);
    });
};
converToSRT = (joinSegmentos) => {
  let srt = "";

  ordenarporId = (a, b) => {
    //pasar a entero primero
    a.id = parseInt(a.id);
    b.id = parseInt(b.id);

    if (a.id > b.id) {
      return 1;
    }
    if (a.id < b.id) {
      return -1;
    }
    return 0;
  };
  joinSegmentos.sort(ordenarporId);

  joinSegmentos.forEach((segmento) => {
    const id = segmento.id;
    const start = segmento.startTime;
    const end = segmento.endTime;
    const text = segmento.text;
    delete segmento.speaker;

    srt += id + "\n";
    srt += start + " --> " + end + "\n";
    srt += text + "\n\n";
  });

  downloadSRT(srt);
};
downloadSRT = (srt) => {
  const element = document.createElement("a");
  const file = new Blob([srt], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = "trackUnido.srt";
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
};
