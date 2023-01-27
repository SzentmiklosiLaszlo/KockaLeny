** KockaLény **

Ezt a programot RETROCREATIVE cstornának írtam.

https://www.twitch.tv/retrocreative

---

## Minta elérhetősége

1. [Kezdőlap](http://slc.hu/kockaleny/)
2. [Látogatói felület](http://slc.hu/kockaleny/frontend/)
3. [Szerkesztő felület](http://slc.hu/kockaleny/backend/)
4. [Szerkesztő felület, 16 színűre butított verzió](http://slc.hu/kockaleny/backend/index16.html)

---

## Telepítés (Szerkesztő felület)

1. git clone https://github.com/SzentmiklosiLaszlo/KockaLeny.git
2. Másold fel a szerveredre a backend könyvtár tartalmát
3. config könyvtárban hozz létre egy kockaleny.json fálj, amibe a program dolgozik. Ezt a kockaleny.json.sample mintájára kell létrehozni. Pl:

copy kockaleny.json.sample kockaleny.json

Fontos: A kockaleny.json -nak legalább egy kockát kell tartalmaznia. Javaslom: a 0. számú kockát tartsd meg és kereszteld át saját névre.

4. Indítsd el az index.html vagy index16.html fájlokkal a szervereden. Az **index.html** sokszínű és egyedi szín is kikeverhesz, a **index16.html** csak 16 színű. Lehet használni felváltva a két szerkesztőfelületet. 16 millió színnel dolgozik a program.

5. Elindult a program? Ha nem, akkor térj vissza az 1. lépésre és ellenőrizd, hogy mindemt jól csináltál-e?
6. Gratulálok, sikeres a telepítés

---

## Telepítés (Látogatói felület)

1. git clone https://github.com/SzentmiklosiLaszlo/KockaLeny.git
2. Másold fel a szerveredre a frontend könyvtár tartalmát
3. config könyvtárba másold be a kockaleny.json fáljt, amit a **Szerkesztői felület** -tel hoztál létre. backend-ben /config/kockaleny.json a neve.

Fontos: A kockaleny.json -nak legalább egy kockát kell tartalmaznia.

4. Indítsd el az index.html fájlt a szervereden.
5. Elindult a program? Ha nem, akkor térj vissza az 1. lépésre és ellenőrizd, hogy mindemt jól csináltál-e?
6. Gratulálok, sikeres a telepítés
7. Oszd meg barátaiddal a **Látogatói felület** címét.

---

## MIT License

Copyright (c) 2023 Szentmiklósi László (SLC)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.