import Astronomy from "astronomy-engine";
try {
    console.log(Astronomy.Body);
    console.log(Astronomy.Ecliptic(Astronomy.Body.Sun, new Date()));
} catch (e) {
    console.error(e.message);
}
