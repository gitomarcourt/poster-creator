let id_movie;
let index = 0;

function resize_to_fit(){
    var fontsize = $('div#title div').css('font-size');
    $('div#title div').css('fontSize', parseFloat(fontsize) - 1);

    if($('div#title div').height() >= $('div#title').height()){
        resize_to_fit();
    }
}
function resize_to_fit2(){
    if($('div#title div').height() >= $('div#title').height()){
        var fontsize = $('div#title div').css('font-size');
        $('div#title div').css('fontSize', parseFloat(fontsize) - 1);
        resize_to_fit()
    } else {
        var fontsize = $('div#title div').css('font-size');
        $('div#title div').css('fontSize', parseFloat(fontsize) + 1);
        resize_to_fit()
    }
}

function palette_colors(img){
    const colorThief = new ColorThief();
    var list_colors = colorThief.getPalette(img, 5);
    document.getElementById('bar').style.background = `rgb(${list_colors[1][0]}, ${list_colors[1][1]}, ${list_colors[1][2]})`
    for (const i in list_colors){
        document.getElementById('palette'+i).style.background = `rgb(${list_colors[i][0]}, ${list_colors[i][1]}, ${list_colors[i][2]})`
    }
}

function setBarWidth(){
    document.getElementById('bar').style.width = document.getElementById('movie_name').clientWidth + 'px'
    document.getElementById('bar').style.maxWidth = '22cm'
    resize_to_fit()
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function htmltopng(id) {
    var img = document.getElementById("imageresult")
    var node = document.getElementById(id);
    domtoimage.toPng(node)
        .then(function (dataUrl) {
            img.src = dataUrl;
            document.body.appendChild(img);
            //palette_colors(img);
        })
        .then(function () {
            palette_colors(img);
            //document.body.removeChild(img);
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
        });
}

function htmltopngresult(){
     var scale = 3;

    domtoimage.toPng(document.getElementById('export'),
        {   quality: 0.99,
            width: document.getElementById('export').clientWidth * scale,
            height: document.getElementById('export').clientHeight * scale,
            style: {
                transform: "scale(" + scale + ")",
                transformOrigin: "top left"
            }
        })
        .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = document.getElementById('movie_name').innerText + '.jpeg';
            link.href = dataUrl;
            link.click();
        });
}

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmOTNmYjJmYzk1NGU2MDNlYWU3ZjE2ZjM2NWRkMDUzNyIsInN1YiI6IjVmYTNmOTlhNWFhZGM0MDAzZTdlZmQyZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.pbqbVH365ZUxyO6Pqdr7A7bPYjA03FWf_g-Zl1r3lHI'
    }
};


function searchImage(id){
    const base_path = 'https://image.tmdb.org/t/p/original'
    fetch('https://api.themoviedb.org/3/tv/'+ id +'/images', options)
        .then(response => response.json())
        .then(function (response){
            if (response.backdrops[index] === undefined){
                index = 0
            }
            var url = base_path + response.backdrops[index].file_path;

            let img = document.getElementById('imageid')
            // img.crossOrigin = "Anonymous";
            // img.src = base_path + response.posters[0].file_path
            img.src = url + '?' + new Date().getTime();
            img.setAttribute('crossOrigin', '');

            //let imgdata = getBase64Image(document.getElementById('imageid'))
            // palette_colors(img)
            htmltopng('imageid')
        })
        .catch(err => console.error(err));
}

function searchInfo(id){
    fetch('https://api.themoviedb.org/3/tv/' + id + '?language=en-US', options)
    .then(response => response.json())
    .then(function (response){
        // searchImage(response.results[0].id)
        document.getElementById('date').innerText = 'Release: ' + response.first_air_date.substring(0,4)
        document.getElementById('movie_name').innerText = response.name
        document.getElementById('imageid').style.cursor = 'pointer'
        resize_to_fit()
    })
    .catch(err => console.error(err));
}

function searchCredits(id){
    fetch('https://api.themoviedb.org/3/tv/' + id + '/credits?language=en-US', options)
        .then(response => response.json())
        .then(function (response){
            let list_director = [];
            let list_actor = [];
            let list_sound = [];
            let list_writing = [];

            // searchImage(response.results[0].id)
            for (let i = 0; i < response.cast.length; i++) {
                if(response.cast[i].known_for_department === 'Acting'){
                    list_actor.push(response.cast[i].name)
                }
            }

            for (let i = 0; i < response.crew.length; i++) {
                if(response.crew[i].known_for_department === 'Directing'){
                    list_director.push(response.crew[i].name)
                }
                if(response.crew[i].known_for_department === 'Sound' && !list_sound.includes(response.crew[i].name)){
                    list_sound.push(response.crew[i].name)
                }
                if(response.crew[i].known_for_department === 'Writing' && !list_writing.includes(response.crew[i].name)){
                    list_writing.push(response.crew[i].name)
                }
            }
            if(list_director.length > 0){document.getElementById('director0').innerText = list_director[0]}
            else{document.getElementById('director0').innerText = list_writing[0]}

            document.getElementById('actor0').innerText = list_actor[0]
            document.getElementById('actor1').innerText = list_actor[1]
            document.getElementById('actor2').innerText = list_actor[2]
            document.getElementById('music0').innerText = list_sound[0]
            document.getElementById('writing0').innerText = list_writing[0] ? list_writing[0] : ''
            document.getElementById('writing1').innerText = list_writing[1] ? list_writing[1] : ''

        })
        .catch(err => console.error(err));
}

function searchTitle(el){
    fetch('https://api.themoviedb.org/3/search/tv?query=' + el.value + '&include_adult=false&language=fr-FR&page=1', options)
        .then(response => response.json())
        .then(function (response){
            console.log(response)
            id_movie = response.results[0].id
            searchImage(id_movie, 0)
            searchInfo(id_movie)
            searchCredits(id_movie)
            document.getElementById('imageid').onclick = function (){
                index += 1
                searchImage(id_movie, index)
            }
            document.getElementById('download').style.display = 'block'
        })
        .catch(err => console.error(err));
}


