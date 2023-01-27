var colorhex = "#FF0000";
var color = "#FF0000";
var colorObj = w3color(color);

function mouseOverColor(hex) {
    document.getElementById("divpreview").style.visibility = "visible";
    document.getElementById("divpreview").style.backgroundColor = hex;
    document.body.style.cursor = "pointer";
}

function mouseOutMap() {
    document.getElementById("divpreview").style.visibility = "hidden";
    document.getElementById("divpreview").style.backgroundColor = colorObj.toHexString();
    document.body.style.cursor = "";
}

function toHex(n) {
    var hex = n.toString(16);
    while (hex.length < 2) { hex = "0" + hex; }
    return hex;
}

function clickColor(hex, seltop, selleft) {
    var c, cObj, colormap, areas, i, areacolor, cc;
    if (hex == 0) {} else {
        c = hex;
    }
    cObj = w3color(c);
    colorhex = cObj.toHexString();
    if (!cObj.valid) {
        return;
    }

    for (let i = 0; i <= 15; i++) {
        if (document.getElementById("colors_" + i)) {
            document.getElementById("colors_" + i).style.border = 'none';
        }
    }
    document.getElementById("cube_label_error").innerHTML = '';
    document.getElementById("cube_label_success").innerHTML = '';
    document.getElementById("red").style.border = 'none';
    document.getElementById("green").style.border = 'none';
    document.getElementById("blue").style.border = 'none';

    if (document.getElementById("colors_" + seltop)) {
        const r = toHex(255 - cObj.toRgb().r);
        const g = toHex(255 - cObj.toRgb().g);
        const b = toHex(255 - cObj.toRgb().b);
        document.getElementById("colors_" + seltop).style.border = '5px dotted #' + r + g + b;
    }

    document.getElementById("colorrgbDIV").innerHTML = cObj.toRgbString();
    document.getElementById("red").value = cObj.toRgb().r;
    document.getElementById("green").value = cObj.toRgb().g;
    document.getElementById("blue").value = cObj.toRgb().b;
    if ((!seltop || seltop == -1) && (!selleft || selleft == -1)) {
        colormap = document.getElementById("colormap");
        areas = colormap.getElementsByTagName("AREA");
        for (i = 0; i < areas.length; i++) {
            areacolor = areas[i].getAttribute("onmouseover").replace('mouseOverColor("', '');
            areacolor = areacolor.replace('")', '');
            if (areacolor.toLowerCase() == colorhex) {
                cc = areas[i].getAttribute("onclick").replace(')', '').split(",");
                seltop = Number(cc[1]);
                selleft = Number(cc[2]);
            }
        }
    }
    if (document.getElementById("selectedhexagon")) {
        if ((seltop + 200) > -1 && selleft > -1) {
            document.getElementById("selectedhexagon").style.top = seltop + "px";
            document.getElementById("selectedhexagon").style.left = selleft + "px";
            document.getElementById("selectedhexagon").style.visibility = "visible";
        } else {
            document.getElementById("divpreview").style.backgroundColor = cObj.toHexString();
            document.getElementById("selectedhexagon").style.visibility = "hidden";
        }
    }
}