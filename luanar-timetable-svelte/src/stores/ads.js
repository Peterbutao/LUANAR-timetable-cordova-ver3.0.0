class AdsObj {
    constructor(ti, mo, ca, te, co, ad, im) {
        this.catergory = ca;
        this.motto = mo;
        this.title = ti;
        this.text = `<ul>${te}</ul>`;
        this.contact = co;
        this.address = ad;
        this.image = im;
    }
}

class imgObj {
    constructor(im) {
        this.image = `assets/${im}.png`;
    }
}

const ads = [
    
    new AdsObj("i saint poems", "poems by i saint the poet", "service", "poem writting", "08801674455", "GWONDWE R1", [new imgObj('is1'), new imgObj('is2')]),       
    new AdsObj("cross avon", "AVON MW", "cosmetics", "<li>watches / male & female clothes</li><li>perfume / body sprays / avon lotion</li>", "0881430022", "BLANTYRE, CHICHIRI 3, GOLITI H83", [new imgObj('cr1'), new imgObj('cr2')]),
    new AdsObj("butao ux/ui dev", "custome made, technology to your malawian liking", "service", "<li>mobile / web application design</li><li>website development</li>", "08801674455", "BUNDA CAMPUS, HAVARD R32", [new imgObj('bt2'), new imgObj('bt1')]),
]

module.exports = ads