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
    document.getElementById("colorrgbDIV").innerHTML = cObj.toRgbString();
    document.getElementById("red").innerHTML = cObj.toRgb().r;
    document.getElementById("green").innerHTML = cObj.toRgb().g;
    document.getElementById("blue").innerHTML = cObj.toRgb().b;
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
    if ((seltop + 200) > -1 && selleft > -1) {
        document.getElementById("selectedhexagon").style.top = seltop + "px";
        document.getElementById("selectedhexagon").style.left = selleft + "px";
        document.getElementById("selectedhexagon").style.visibility = "visible";
    } else {
        document.getElementById("divpreview").style.backgroundColor = cObj.toHexString();
        document.getElementById("selectedhexagon").style.visibility = "hidden";
    }
}