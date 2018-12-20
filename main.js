
const request = require("request");
const params = process.argv.slice(2)
const fuckeduptags = [
  "snuff","penis birth","amputee", "yaoi",
  "cannibalism", "guro", "all the way through",
  "blood", "rape", "stomach deformation", "eggs",
  "ahegao", "drugs", "mind break", "brain fuck",
  "netorare", "multiple penises", "crossdressing",
  "humiliation", "torture", "scat", "armpit licking",
  "vomit", "public use", "enema", "coprophagia", 
  "necrophilia", "inflation", "rimjob", "smell",
  "hairy armpits", "dilf", "diaper", "abortion"
]

function reqFromTags(tags, cb) {

  // format tags for use with url
  jtags = tags;
  otags = tags;
  if (typeof(tags) == "object") {
    tags  = tags.map(t=>t.split(" ").join("-"));
    jtags = tags.join("+");
  } else {
    jtags.replace(" ","-")
  }
  url = "https://nhentai.net/api/galleries/search?query=" + jtags;
  request.get(url, (err, res, body) => {
    // format res to JSON
    resJSON = JSON.parse(res.body);

    if (resJSON.result.length > 0) {

      r = Math.round(Math.random()*(resJSON.result.length-1));
      o = resJSON.result[r];
      tags = o.tags.filter(t=>t.type='tag').map(t=>t.name);
      d = new Doujin(o.title.pretty, o.id, tags, o.num_pages, o.num_favorites, otags)
      cb(d, 0)

    } else {
      cb(new Doujin(), 1);
    }
  });
}

function joinIf(array, joinwith, condition){
  if (condition) {
    return array.join(joinwith);
  } else {
    return array;
  }
}

function Doujin(title, id, tags, npages, nfav, fwtags){
  this.title  = title  || null;
  this.id     = id     || null;
  this.tags   = tags   || [];
  this.fwtags = fwtags || []  ;
  this.npages = npages || null;
  this.nfav   = nfav   || null;
  this.empty  = this.title || this.id || this.tags || this.fwtags || this.npages || this.nfav
                ? 0 : 1
  this.type   = "doujin"
}

function splitIf(arr, perline, offset){
  out = "";
  c = perline;
  for (i in arr) {
    if (c == 0){
      out=`${out}\n${offset}`;
      c  = perline;
    }
    out += arr[i] + (i == arr.length-1 ? "" : ", ");
    c   -= 1;
  }
  return out;
}

function dPrint(doujin, tagsperline){
  if (doujin.type == "doujin") {

    if (doujin.empty){
      return;
    }

    if (typeof(doujin.tags) == "object" ){
      if (typeof(doujin.fwtags) == "object") {
        tags = doujin.tags.filter(t=>doujin.fwtags.indexOf(t) == -1)
      } else if (typeof(doujin.fwtags) == "string") { 
        i = doujin.tags.indexOf(doujin.fwtags)
        if (i > -1){
          doujin.tags.splice(i, 1)
        }
      }

    } else if (typeof(doujin.tags) == "string") {

      if (typeof(doujin.fwtags) == "string") {
        tags = doujin.fwtags == doujin.tags ? "" : doujin.tags;

      } else if (typeof(doujin.fwtags) == "object") {
        tags = doujin.fwtags.indexOf(doujin.tags) > -1 ? "" : doujin.tags;
      }
    }

    //fwtags = joinIf(doujin.fwtags, ", ", typeof(doujin.fwtags)=="object");
    //tags   = joinIf(tags, ", ", typeof(tags  )=="object");

    fwtags = splitIf(doujin.fwtags, tagsperline||3, "                ");
      tags = splitIf(tags, tagsperline||3,   "                ");

    console.log(`
        ${doujin.title} (${doujin.id})
      ${"—".repeat( Math.round((doujin.title + ` (${doujin.id})`).length + 4 ))}
        tags:   ${fwtags}
                ${tags}

        —   ${doujin.nfav} ★    <>   ${doujin.npages} ✒︎   —
    `);
  }
}

function randomTags(n) {
  tags = [];
  while (n > 0) {
    r = Math.round(Math.random()*(fuckeduptags.length-1));
    if (tags.indexOf(fuckeduptags[r]) == -1) {
      tags.push(fuckeduptags[r]);
      n -= 1;
    }
    fuckeduptags[r]
  }
  return tags;
}

if (params.length > 0) {
  if (params[0][0] == "-") {

    nparam = parseInt(params[0].slice(1)) || 1;
    tags   = randomTags(nparam)
    reqFromTags(tags, (d, err) => {
      if (!err){
        dPrint(d)
      } else {
        console.log(`Nothing found for: ${tags.join(', ')}`)
      }
    })


  } else if ( parseInt(params[0]) > 0 ) {
    request.get("https://nhentai.net/api/gallery/"+params[0], (err, res, body)=>{
      resjs = JSON.parse(res.body);
      tags  = resjs.tags.filter(t=>t.type=="tag").map(t=>t.name);
      d     = new Doujin(resjs.title.pretty, resjs.id, tags, resjs.num_pages, resjs.num_favorites, null)
      dPrint(d)
    })
  } 
} else {
  rtag = Math.round(Math.random()*(fuckeduptags.length-1));
  request.get(`https://nhentai.net/api/galleries/search?query="${fuckeduptags[rtag]}"`, (err, res, body)=>{
    resjs = JSON.parse(res.body);
    resjs = resjs.result[Math.round(Math.random()*resjs.result.length)];
    tags  = resjs.tags.filter(t=>t.type=="tag").map(t=>t.name);
    d     = new Doujin(resjs.title.pretty, resjs.id, tags, resjs.num_pages, resjs.num_favorites, null)
    dPrint(d);
    
  })
}