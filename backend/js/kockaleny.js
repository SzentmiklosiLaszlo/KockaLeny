// =============================================================
//           ===== CANVAS 3D experiment =====
//     ===== simple 3D cubes HTML5 engine ====
// script written by Gerard Ferrandez - January 2, 2012
// http://www.dhteumeuleu.com
//
// v1.1 Szentmiklósi László - January 17, 2023
// http://slc.hu
// https://github.com/SzentmiklosiLaszlo/KockaLeny
// add: cube id, cube label, multi color cubes, load and save functions to JSON file with PHP, search function: color and B&W style, same cube labels
// =============================================================

"use strict";

(function() {
    // ======== private vars ========
    var scr, canvas, cubes, faces, nx, ny, nw, nh, xm = 0,
        ym = 0,
        cx = 50,
        cy = 50,
        cz = 0,
        cxb = 0,
        cyb = 0;
    var ncube, npoly, faceOver, drag, moved, startX = 0,
        startY = 0;
    var cosY, sinY, cosX, sinX, cosZ, sinZ, minZ, angleY = 0,
        angleX = 0,
        angleZ = 0;
    var bkgColor1 = "rgba(0,0,0,0.1)";
    var bkgColor2 = "rgba(32,32,32,1)";
    var autorotate = false,
        destroy = false,
        running = true;
    var cubes_data = [];
    var cube_search = '';
    // ---- fov ----
    var fl = 250;
    var zoom = 0;
    // ======== canvas constructor ========
    var Canvas = function(id) {
        this.container = document.getElementById(id);
        this.ctx = this.container.getContext("2d");
        this.resize = function(w, h) {
            this.container.width = w;
            this.container.height = h;
        }
    };
    // ======== vertex constructor ========
    var Point = function(parent, xyz, project) {
        this.project = project;
        this.xo = xyz[0];
        this.yo = xyz[1];
        this.zo = xyz[2];
        this.cube = parent;
    };
    Point.prototype.projection = function() {
        // ---- 3D rotation ----
        var x = cosY * (sinZ * this.yo + cosZ * this.xo) - sinY * this.zo;
        var y = sinX * (cosY * this.zo + sinY * (sinZ * this.yo + cosZ * this.xo)) + cosX * (cosZ * this.yo - sinZ * this.xo);
        var z = cosX * (cosY * this.zo + sinY * (sinZ * this.yo + cosZ * this.xo)) - sinX * (cosZ * this.yo - sinZ * this.xo);
        this.x = x;
        this.y = y;
        this.z = z;
        if (this.project) {
            // ---- point visible ----
            if (z < minZ) minZ = z;
            this.visible = (zoom + z > 0);
            // ---- 3D to 2D projection ----
            this.X = (nw * 0.5) + x * (fl / (z + zoom));
            this.Y = (nh * 0.5) + y * (fl / (z + zoom));
        }
    };
    // ======= polygon constructor ========
    var Face = function(cube, index, normalVector) {
        // ---- parent cube ----
        this.cube = cube;
        // ---- coordinates ----
        this.p0 = cube.points[index[0]];
        this.p1 = cube.points[index[1]];
        this.p2 = cube.points[index[2]];
        this.p3 = cube.points[index[3]];
        // ---- normal vector ----
        this.normal = new Point(this, normalVector, false)
            // ---- # faces ----
        npoly++;
    };
    Face.prototype.pointerInside = function() {
        // ---- Is Point Inside Triangle? ----
        // http://2000clicks.com/mathhelp/GeometryPointAndTriangle2.aspx
        var fAB = function(p1, p2, p3) { return (ym - p1.Y) * (p2.X - p1.X) - (xm - p1.X) * (p2.Y - p1.Y); };
        var fCA = function(p1, p2, p3) { return (ym - p3.Y) * (p1.X - p3.X) - (xm - p3.X) * (p1.Y - p3.Y); };
        var fBC = function(p1, p2, p3) { return (ym - p2.Y) * (p3.X - p2.X) - (xm - p2.X) * (p3.Y - p2.Y); };
        if (
            fAB(this.p0, this.p1, this.p3) * fBC(this.p0, this.p1, this.p3) > 0 &&
            fBC(this.p0, this.p1, this.p3) * fCA(this.p0, this.p1, this.p3) > 0
        ) return true;
        if (
            fAB(this.p1, this.p2, this.p3) * fBC(this.p1, this.p2, this.p3) > 0 &&
            fBC(this.p1, this.p2, this.p3) * fCA(this.p1, this.p2, this.p3) > 0
        ) return true;
        // ----
        return false;
    };
    Face.prototype.faceVisible = function() {
        // ---- points visible ----
        if (this.p0.visible && this.p1.visible && this.p2.visible && this.p3.visible) {
            // ---- back face culling ----
            if ((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) < (this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X) ^ this.p0.X < this.p1.X == this.p0.X > this.p2.X) {
                // ---- face visible ----
                this.visible = true;
                return true;
            }
        }
        // ---- face hidden ----
        this.visible = false;
        this.distance = -99999;
        return false;
    };
    Face.prototype.distanceToCamera = function() {
        // ---- distance to camera ----
        var dx = (this.p0.x + this.p1.x + this.p2.x + this.p3.x) * 0.25;
        var dy = (this.p0.y + this.p1.y + this.p2.y + this.p3.y) * 0.25;
        var dz = (zoom + fl) + (this.p0.z + this.p1.z + this.p2.z + this.p3.z) * 0.25;
        this.distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    };
    Face.prototype.draw = function() {
        // ---- shape face ----
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(this.p0.X, this.p0.Y);
        canvas.ctx.lineTo(this.p1.X, this.p1.Y);
        canvas.ctx.lineTo(this.p2.X, this.p2.Y);
        canvas.ctx.lineTo(this.p3.X, this.p3.Y);

        // ---- label ----
        // canvas.ctx.textAlign = "center";
        canvas.ctx.textBaseline = "bottom";
        canvas.ctx.font = '16px Arial Black';
        canvas.ctx.fillText(this.cube.cube_label, this.p0.X, this.p0.Y);
        canvas.ctx.closePath();

        // ---- light ----
        if (this == faceOver) {
            var r = 255;
            var g = 0;
            var b = 0;
        } else {
            // ---- flat (lambert) shading ----
            this.normal.projection();
            var light = (
                this.normal.z
            ) * 1;
            var r = light * this.cube.r;
            var g = light * this.cube.g;
            var b = light * this.cube.b;
        }
        // ---- fill ----
        // if (('' == cube_search) || (this.cube.cube_label.toLowerCase() == cube_search.toLowerCase())) {
        if (('' == cube_search) || (-1 < this.cube.cube_label.toLowerCase().indexOf(cube_search.toLowerCase()))) {
            canvas.ctx.fillStyle = "rgba(" +
                Math.round(r) + "," +
                Math.round(g) + "," +
                Math.round(b) + "," + 1 + ")";

        } else {
            var r = g = b = light * 255;
            canvas.ctx.fillStyle = "rgba(" +
                Math.round(r) + "," +
                Math.round(g) + "," +
                Math.round(b) + "," + 0.2 + ")";
        }

        canvas.ctx.fill();
    };
    // ======== Cube constructor ========
    var Cube = function(id, cube_label, r, g, b, parent, nx, ny, nz, x, y, z, w) {
        this.id = parseInt(id, 10);
        this.cube_label = cube_label;
        this.r = parseInt(r);
        this.g = parseInt(g);
        this.b = parseInt(b);
        this.coordinate = {
            x: 0,
            y: 0,
            z: 0
        };

        if (parent) {
            // ---- translate parent points ----
            this.w = parent.w;
            this.points = [];
            var i = 0,
                p;

            while (p = parent.points[i++]) {
                this.coordinate.x += p.xo;
                this.coordinate.y += p.yo;
                this.coordinate.z += p.zo;
                this.points.push(
                    new Point(
                        parent, [p.xo + nx, p.yo + ny, p.zo + nz],
                        true
                    )
                );
            }
            this.coordinate.x = this.coordinate.x / parent.points.length;
            this.coordinate.y = this.coordinate.y / parent.points.length;
            this.coordinate.z = this.coordinate.z / parent.points.length;
        } else {
            // ---- create points ----
            this.w = w;
            this.points = [];
            var p = [
                [x - w, y - w, z - w],
                [x + w, y - w, z - w],
                [x + w, y + w, z - w],
                [x - w, y + w, z - w],
                [x - w, y - w, z + w],
                [x + w, y - w, z + w],
                [x + w, y + w, z + w],
                [x - w, y + w, z + w]
            ];
            for (var i in p) this.points.push(
                new Point(this, p[i], true)
            );
        }
        // ---- faces coordinates ----
        var f = [
            [0, 1, 2, 3],
            [0, 4, 5, 1],
            [3, 2, 6, 7],
            [0, 3, 7, 4],
            [1, 5, 6, 2],
            [5, 4, 7, 6]
        ];
        // ---- faces normals ----
        var nv = [
            [0, 0, 1],
            [0, 1, 0],
            [0, -1, 0],
            [1, 0, 0],
            [-1, 0, 0],
            [0, 0, -1]
        ];
        // ---- push faces ----
        for (var i in f) {
            faces.push(
                new Face(this, f[i], nv[i])
            );
        }
        ncube++;
    };
    ////////////////////////////////////////////////////////////////////////////
    var resize = function() {
        // ---- screen resize ----
        nw = scr.offsetWidth;
        nh = scr.offsetHeight;
        var o = scr;
        for (nx = 0, ny = 0; o != null; o = o.offsetParent) {
            nx += o.offsetLeft;
            ny += o.offsetTop;
        }
        canvas.resize(nw, nh);
    };
    var reset = function() {
        // ---- create first cube ----
        cubes = [];
        faces = [];
        ncube = 0;
        npoly = 0;

        fetch('./config/kockaleny.json?ts=' + Date.now())
            .then((response) => response.json())
            .then((data) => {
                cubes_data = data;
                let first_element = true;
                data.forEach(e => {
                    if (first_element) {
                        cubes.push(
                            new Cube(e[0], e[1], e[2], e[3], e[4], false, 0, 0, 0, 0, 0, 0, 50)
                        );
                        first_element = false;
                    } else {
                        cubes.push(
                            new Cube(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9], e[10], e[11], e[12])
                        );
                    }
                    detectFaceOver();
                });
            }).catch((error) => {
                document.getElementById("cube_label_error").innerHTML = 'Hiba: Sikertelen betöltés! ' + error;
            });
    };
    var detectFaceOver = function() {
        // ---- detect pointer over face ----
        var j = 0,
            f;
        faceOver = false;
        while (f = faces[j++]) {
            if (f.visible) {
                if (f.pointerInside()) {
                    faceOver = f;
                }
            } else break;
        }
    };
    var save_cubes = function(data) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    if (this.response.success) {
                        document.getElementById("cube_label_success").innerHTML = 'Sikeres mentés!';

                        if (destroy) {
                            destroy = false;
                            document.getElementById("destroy").checked = false;
                            // ---- engine start ----
                            reset();
                            run();
                        }

                    } else {
                        document.getElementById("cube_label_error").innerHTML = 'Hiba: Sikertelen mentés!';
                    }
                } else {
                    document.getElementById("cube_label_error").innerHTML = 'Hiba: Sikertelen mentés!';
                }
            }
        };
        xmlhttp.open("POST", "saver_xZMYPMv0AjUpEpzR.php", true);
        xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xmlhttp.responseType = 'json';
        xmlhttp.send('json=' + JSON.stringify(data));
    };
    var click = function() {
        document.getElementById("cube_label_error").innerHTML = '';
        document.getElementById("cube_label_success").innerHTML = '';
        // ---- click cube ----
        detectFaceOver();
        if (faceOver) {
            if (destroy) {
                if (ncube > 1) {
                    var c = faceOver.cube;
                    faceOver.clicked = false;
                    // ---- destroy faces ----
                    var i = 0,
                        f;
                    while (f = faces[i++]) {
                        if (f.cube == c) {
                            faces.splice(--i, 1);
                            npoly--;
                        }
                    }
                    // ---- destroy cube ----
                    var i = 0,
                        o;
                    while (o = cubes[i++]) {
                        if (o == c) {
                            cubes.splice(--i, 1);
                            ncube--;
                            break;
                        }
                    }
                    // ---- destroy cubes_data ----
                    var i = 0,
                        o;
                    while (o = cubes_data[i++]) {
                        if (o[0] == c.id) {
                            cubes_data.splice(--i, 1);
                            break;
                        }
                    }
                }

            } else {
                if (faceOver.clicked) {
                    return;
                }

                if ('' == document.getElementById("cube_label").value) {
                    document.getElementById("cube_label_error").innerHTML = 'Hiba: A kocka felirata nem lehet üres!';
                    return;
                }

                if ('' == document.getElementById("cube_label_same").checked) {
                    for (let i = 0; i < cubes.length; i++) {
                        if (cubes[i].cube_label.toLowerCase() == document.getElementById("cube_label").value.toLowerCase()) {
                            document.getElementById("cube_label_error").innerHTML = 'Hiba: Ilyen kocka felirat már van!';
                            return;
                        }
                    }
                }

                var keys = Object.keys(cubes);
                var ids = keys.map(function(v) { return cubes[v].id; });
                var empty_id = -1;
                while (-1 < ids.indexOf(++empty_id)) {};

                faceOver.clicked = true;
                var w = -2.25 * faceOver.cube.w;

                var e = [
                    empty_id,
                    document.getElementById("cube_label").value,
                    parseInt(document.getElementById("red").innerHTML, 10) || 0,
                    parseInt(document.getElementById("green").innerHTML, 10) || 0,
                    parseInt(document.getElementById("blue").innerHTML, 10) || 0,
                    false,
                    0, 0, 0,
                    w * faceOver.normal.xo,
                    w * faceOver.normal.yo,
                    w * faceOver.normal.zo,
                    50
                ];

                // ---- create new cube ----
                var last_cube = new Cube(e[0], e[1], e[2], e[3], e[4], faceOver.cube, e[9], e[10], e[11]);
                cubes.push(last_cube);

                detectFaceOver();

                e[9] += last_cube.coordinate.x;
                e[10] += last_cube.coordinate.y;
                e[11] += last_cube.coordinate.z;

                cubes_data.push(e);

            }
            save_cubes(cubes_data);
        }
    };
    ////////////////////////////////////////////////////////////////////////////
    var init = function() {
            // ---- init script ----
            scr = document.getElementById("screen");
            canvas = new Canvas("canvas");
            // ======== unified touch/mouse events handler ========
            scr.ontouchstart = scr.onmousedown = function(e) {
                if (!running) return true;
                // ---- touchstart ----
                if (e.target !== canvas.container) return;
                e.preventDefault(); // prevents scrolling
                if (scr.setCapture) scr.setCapture();
                moved = false;
                drag = true;
                startX = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX) - nx;
                startY = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY) - ny;
            };
            scr.ontouchmove = scr.onmousemove = function(e) {
                if (!running) return true;
                // ---- touchmove ----
                e.preventDefault();
                xm = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX) - nx;
                ym = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY) - ny;
                detectFaceOver();
                if (drag) {
                    cx = cxb + (xm - startX);
                    cy = cyb - (ym - startY);
                }
                if (Math.abs(xm - startX) > 10 || Math.abs(ym - startY) > 10) {
                    // ---- if pointer moves then cancel the tap/click ----
                    moved = true;
                }
            };
            scr.ontouchend = scr.onmouseup = function(e) {
                if (!running) return true;
                // ---- touchend ----
                e.preventDefault();
                if (scr.releaseCapture) scr.releaseCapture();
                drag = false;
                cxb = cx;
                cyb = cy;
                if (!moved) {
                    // ---- click/tap ----
                    xm = startX;
                    ym = startY;
                    click();
                }
            };
            scr.ontouchcancel = function(e) {
                if (!running) return true;
                // ---- reset ----
                if (scr.releaseCapture) scr.releaseCapture();
                moved = false;
                drag = false;
                cxb = cx;
                cyb = cy;
                startX = 0;
                startY = 0;
            };
            // ---- Z axis rotation (mouse wheel) ----
            scr.addEventListener('DOMMouseScroll', function(e) {
                if (!running) return true;
                cz += e.detail * 12;
                return false;
            }, false);
            scr.onmousewheel = function() {
                    if (!running) return true;
                    cz += event.wheelDelta / 5;
                    return false;
                }
                // ---- multi-touch gestures ----
            document.addEventListener('gesturechange', function(e) {
                if (!running) return true;
                e.preventDefault();
                // ---- Z axis rotation ----
                cz = event.rotation;
            }, false);
            // ---- screen size ----
            resize();
            window.addEventListener('resize', resize, false);
            // ---- some UI options ----
            document.getElementById("autorotate").onchange = function() {
                autorotate = this.checked;
            }
            document.getElementById("destroy").onchange = function() {
                destroy = this.checked;
            }
            document.getElementById("cube_search").onkeyup = function() {
                cube_search = this.value;
                detectFaceOver();
            }

            // ---- engine start ----
            reset();
            run();
        }
        ////////////////////////////////////////////////////////////////////////////
        // ======== main loop ========
    var run = function() {
        // ---- screen background ----
        canvas.ctx.fillStyle = bkgColor1;
        canvas.ctx.fillRect(0, Math.floor(nh * 0.15), nw, Math.ceil(nh * 0.7));
        canvas.ctx.fillStyle = bkgColor2;
        canvas.ctx.fillRect(0, 0, nw, Math.ceil(nh * 0.15));
        canvas.ctx.fillStyle = bkgColor2;
        canvas.ctx.fillRect(0, Math.floor(nh * 0.85), nw, Math.ceil(nh * 0.15));
        // ---- easing rotations ----
        angleX += ((cy - angleX) * 0.05);
        angleY += ((cx - angleY) * 0.05);
        angleZ += ((cz - angleZ) * 0.05);
        if (autorotate) cz += 1;
        // ---- pre-calculating trigo ----
        cosY = Math.cos(angleY * 0.01);
        sinY = Math.sin(angleY * 0.01);
        cosX = Math.cos(angleX * 0.01);
        sinX = Math.sin(angleX * 0.01);
        cosZ = Math.cos(angleZ * 0.01);
        sinZ = Math.sin(angleZ * 0.01);
        // ---- points projection ----
        minZ = 0;
        var i = 0,
            c;
        while (c = cubes[i++]) {
            var j = 0,
                p;
            while (p = c.points[j++]) {
                p.projection();
            }
        }
        // ---- adapt zoom ----
        var d = -minZ + 100 - zoom;
        zoom += (d * ((d > 0) ? 0.05 : 0.01));
        // ---- faces light ----
        var j = 0,
            f;
        while (f = faces[j++]) {
            if (f.faceVisible()) {
                f.distanceToCamera();
            }
        }
        // ---- faces depth sorting ----
        faces.sort(function(p0, p1) {
            return p1.distance - p0.distance;
        });
        // ---- painting faces ----
        j = 0;
        while (f = faces[j++]) {
            if (f.visible) {
                f.draw();
            } else break;
        }
        // ---- animation loop ----
        if (running) setTimeout(run, 16);
    }
    return {
        ////////////////////////////////////////////////////////////////////////////
        // ---- onload event ----
        load: function() {
            window.addEventListener('load', function() {
                init();
            }, false);
        }
    }
})().load();