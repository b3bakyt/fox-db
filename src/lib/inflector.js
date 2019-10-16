
/**
 * @var array the rules for converting a word into its plural form.
 * The keys are the regular expressions and the values are the corresponding replacements.
 */
const PLURALS = {
    '([nrlm]ese|deer|fish|sheep|measles|ois|pox|media)$': {replace: '$1', option: 'i'},
    '(sea[- ]bass)$': {replace: '$1', option: 'i'},
    '(m)ove$': {replace: '$1oves', option: 'i'},
    '(f)oot$': {replace: '$1eet', option: 'i'},
    '(h)uman$': {replace: '$1umans', option: 'i'},
    '(s)tatus$': {replace: '$1tatuses', option: 'i'},
    '(s)taff$': {replace: '$1taff', option: 'i'},
    '(t)ooth$': {replace: '$1eeth', option: 'i'},
    '(quiz)$': {replace: '$1zes', option: 'i'},
    '^(ox)$': {replace: '$1$2en', option: 'i'},
    '([m|l])ouse$': {replace: '$1ice', option: 'i'},
    '(matr|vert|ind)(ix|ex)$': {replace: '$1ices', option: 'i'},
    '(x|ch|ss|sh)$': {replace: '$1es', option: 'i'},
    '([^aeiouy]|qu)y$': {replace: '$1ies', option: 'i'},
    '(hive)$': {replace: '$1s', option: 'i'},
    '(?:([^f])fe|([lr])f)$': {replace: '$1$2ves', option: 'i'},
    'sis$': {replace: 'ses', option: 'i'},
    '([ti])um$': {replace: '$1a', option: 'i'},
    '(p)erson$': {replace: '$1eople', option: 'i'},
    '(m)an$': {replace: '$1en', option: 'i'},
    '(c)hild$': {replace: '$1hildren', option: 'i'},
    '(buffal|tomat|potat|ech|her|vet)o$': {replace: '$1oes', option: 'i'},
    '(alumn|bacill|cact|foc|fung|nucle|radi|stimul|syllab|termin|vir)us$': {replace: '$1i', option: 'i'},
    'us$': {replace: 'uses', option: 'i'},
    '(alias)$': {replace: '$1es', option: 'i'},
    '(ax|cris|test)is$': {replace: '$1es', option: 'i'},
    's$': {replace: 's'},
    '^$': {replace: ''},
    '$': {replace: 's'},
};

/**
 * @var array the rules for converting a word into its singular form.
 * The keys are the regular expressions and the values are the corresponding replacements.
 */
const SINGULARS = {
    '([nrlm]ese|deer|fish|sheep|measles|ois|pox|media|ss)$': {replace: '$1', option: 'i'},
    '^(sea[- ]bass)$': {replace: '$1', option: 'i'},
    '(s)tatuses$': {replace: '$1tatus', option: 'i'},
    '(f)eet$': {replace: '$1oot', option: 'i'},
    '(t)eeth$': {replace: '$1ooth', option: 'i'},
    '^(.*)(menu)s$': {replace: '$1$2', option: 'i'},
    '(quiz)zes$': {replace: '$$1', option: 'i'},
    '(matr)ices$': {replace: '$1ix', option: 'i'},
    '(vert|ind)ices$': {replace: '$1ex', option: 'i'},
    '^(ox)en': {replace: '$1', option: 'i'},
    '(alias)(es)*$': {replace: '$1', option: 'i'},
    '(alumn|bacill|cact|foc|fung|nucle|radi|stimul|syllab|termin|viri?)i$': {replace: '$1us', option: 'i'},
    '([ftw]ax)es': {replace: '$1', option: 'i'},
    '(cris|ax|test)es$': {replace: '$1is', option: 'i'},
    '(shoe|slave)s$': {replace: '$1', option: 'i'},
    '(o)es$': {replace: '$1', option: 'i'},
    'ouses$/': 'ouse',
    '([^a])uses$/': '$1us',
    '([m|l])ice$': {replace: '$1ouse', option: 'i'},
    '(x|ch|ss|sh)es$': {replace: '$1', option: 'i'},
    '(m)ovies$': {replace: '$1$2ovie', option: 'i'},
    '(s)eries$': {replace: '$1$2eries', option: 'i'},
    '([^aeiouy]|qu)ies$': {replace: '$1y', option: 'i'},
    '([lr])ves$': {replace: '$1f', option: 'i'},
    '(tive)s$': {replace: '$1', option: 'i'},
    '(hive)s$': {replace: '$1', option: 'i'},
    '(drive)s$': {replace: '$1', option: 'i'},
    '([^fo])ves$': {replace: '$1fe', option: 'i'},
    '(^analy)ses$': {replace: '$1sis', option: 'i'},
    '(analy|diagno|^ba|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': {replace: '$1$2sis', option: 'i'},
    '([ti])a$': {replace: '$1um', option: 'i'},
    '(p)eople$': {replace: '$1$2erson', option: 'i'},
    '(m)en$': {replace: '$1an', option: 'i'},
    '(c)hildren$': {replace: '$1$2hild', option: 'i'},
    '(n)ews$': {replace: '$1$2ews', option: 'i'},
    'eaus$': {replace: 'eau'},
    '^(.*us)$': {replace: '$\1'},
    's$': {replace: '', option: 'i'},
};

/**
 * @var array the special rules for converting a word between its plural form and singular form.
 * The keys are the special words in singular form, and the values are the corresponding plural form.
 */
const SINGLE_PLURALS = {
    'atlas': 'atlases',
    'beef': 'beefs',
    'brother': 'brothers',
    'cafe': 'cafes',
    'child': 'children',
    'cookie': 'cookies',
    'corpus': 'corpuses',
    'cow': 'cows',
    'curve': 'curves',
    'foe': 'foes',
    'ganglion': 'ganglions',
    'genie': 'genies',
    'genus': 'genera',
    'graffito': 'graffiti',
    'hoof': 'hoofs',
    'loaf': 'loaves',
    'man': 'men',
    'money': 'monies',
    'mongoose': 'mongooses',
    'move': 'moves',
    'mythos': 'mythoi',
    'niche': 'niches',
    'numen': 'numina',
    'occiput': 'occiputs',
    'octopus': 'octopuses',
    'opus': 'opuses',
    'ox': 'oxen',
    'penis': 'penises',
    'sex': 'sexes',
    'soliloquy': 'soliloquies',
    'testis': 'testes',
    'trilby': 'trilbys',
    'turf': 'turfs',
    'wave': 'waves',
    'Amoyese': 'Amoyese',
    'bison': 'bison',
    'Borghese': 'Borghese',
    'bream': 'bream',
    'breeches': 'breeches',
    'britches': 'britches',
    'buffalo': 'buffalo',
    'cantus': 'cantus',
    'carp': 'carp',
    'chassis': 'chassis',
    'clippers': 'clippers',
    'cod': 'cod',
    'coitus': 'coitus',
    'Congoese': 'Congoese',
    'contretemps': 'contretemps',
    'corps': 'corps',
    'debris': 'debris',
    'diabetes': 'diabetes',
    'djinn': 'djinn',
    'eland': 'eland',
    'elk': 'elk',
    'equipment': 'equipment',
    'Faroese': 'Faroese',
    'flounder': 'flounder',
    'Foochowese': 'Foochowese',
    'gallows': 'gallows',
    'Genevese': 'Genevese',
    'Genoese': 'Genoese',
    'Gilbertese': 'Gilbertese',
    'graffiti': 'graffiti',
    'headquarters': 'headquarters',
    'herpes': 'herpes',
    'hijinks': 'hijinks',
    'Hottentotese': 'Hottentotese',
    'information': 'information',
    'innings': 'innings',
    'jackanapes': 'jackanapes',
    'Kiplingese': 'Kiplingese',
    'Kongoese': 'Kongoese',
    'Lucchese': 'Lucchese',
    'mackerel': 'mackerel',
    'Maltese': 'Maltese',
    'mews': 'mews',
    'moose': 'moose',
    'mumps': 'mumps',
    'Nankingese': 'Nankingese',
    'news': 'news',
    'nexus': 'nexus',
    'Niasese': 'Niasese',
    'Pekingese': 'Pekingese',
    'Piedmontese': 'Piedmontese',
    'pincers': 'pincers',
    'Pistoiese': 'Pistoiese',
    'pliers': 'pliers',
    'Portuguese': 'Portuguese',
    'proceedings': 'proceedings',
    'rabies': 'rabies',
    'rice': 'rice',
    'rhinoceros': 'rhinoceros',
    'salmon': 'salmon',
    'Sarawakese': 'Sarawakese',
    'scissors': 'scissors',
    'series': 'series',
    'Shavese': 'Shavese',
    'shears': 'shears',
    'siemens': 'siemens',
    'species': 'species',
    'swine': 'swine',
    'testes': 'testes',
    'trousers': 'trousers',
    'trout': 'trout',
    'tuna': 'tuna',
    'Vermontese': 'Vermontese',
    'Wenchowese': 'Wenchowese',
    'whiting': 'whiting',
    'wildebeest': 'wildebeest',
    'Yengeese': 'Yengeese',
    'aircraft': 'aircraft',
    'alumna': 'alumnae',
    'fez': 'fezes',
    'goose': 'geese',
    'locus': 'loci',
    'minutia': 'minutiae',
    'ovum': 'ova',
    'phylum': 'phyla',
    'thief': 'thieves',
};

/**
 * @var array the special rules for converting a word between its singular form and plural form.
 * The keys are the special words in plural form, and the values are the corresponding singular form.
 */
const PLURAL_SINGLES = Object.entries(SINGLE_PLURALS).reduce((res, val) => {
    return {...res, [val[1]]: val[0]}
}, {});

const Inflector = {
    /**
     * Converts a word to its plural form.
     * Note that this is for English only!
     * For example, 'apple' will become 'apples', and 'child' will become 'children'.
     * @param string word the word to be pluralized
     * @return string the pluralized word
     */
    pluralize: function(word) {
        if (SINGLE_PLURALS[word])
            return SINGLE_PLURALS[word];

        for (let rule in PLURALS) {
            const replaceData = PLURALS[rule];

            let match = word.match(new RegExp(rule, replaceData.option));
            if (match)
                return word.replace(new RegExp(rule, replaceData.option), replaceData.replace);
        }
        return word;
    },
    /**
     * Returns the singular of the word
     * @param string word the english word to singularize
     * @return string Singular noun.
     */
    singularize: function(word) {
        const result = PLURAL_SINGLES[word];
        if (result) {
            return result;
        }
        for (let rule in SINGULARS) {
            const replaceData = SINGULARS[rule];

            let match = word.match(new RegExp(rule, replaceData.option));
            if (match)
                return word.replace(new RegExp(rule, replaceData.option), replaceData.replace);
        }
        return word;
    },
};

module.exports = Inflector;
