import { addCss } from "../utils/inject";
import createDeclarationBlock from "../utils/create-declaration-block";
import hash from "../hash";
import { isMediaOrPseudo, isPseudo, createCssRule } from "../utils/common";

const splitMediaOrStyle = (style) => {
  const media = {};
  const styleObj = {};
  Object.entries(style).map(([key, value]) => {
    if (isMediaOrPseudo(key)) {
      media[key] = value;
    } else {
      styleObj[key] = value;
    }
  });

  return { media, styles: styleObj };
}

const splitPseudoOrStyle = (style) => {
  const pseudo = {};
  const styleObj = {};
  Object.entries(style).map(([key, value]) => {
    if (isPseudo(key)) {
      pseudo[key] = value;
    } else {
      styleObj[key] = value;
    }
  });
  return { pseudo, styles: styleObj };
}

const addSingleCss = ( query, style, pseudo = {}) => {
  const css = createDeclarationBlock(style);
  const stringHash = `rnmq-${hash(`${query}${css}${JSON.stringify(pseudo)}`)}`;
  const rule = createCssRule(query, stringHash, css);
  addCss(`${stringHash}`, rule);
  return {  stringHash };
}

const addPseudoCss = (stringHash, query,pseudo, style) => {
  const css = createDeclarationBlock(style);
  const rule = createCssRule(query, stringHash, css, pseudo);
  // console.log('rule', rule);
  addCss(`${stringHash}`, rule);
  return {  stringHash };
}


const createStyleSheet = (stylesWithQuery) => {
  if (!stylesWithQuery) return { ids: {}, styles: {}, fullStyles: {} };

  let ids = {};
  let cleanStyles = {};
  Object.entries(stylesWithQuery).map(([key, value]) => {
    const { media, styles } = splitMediaOrStyle(value);
    Object.entries(media).map(([query, style]) => {
      const { pseudo, styles } = splitPseudoOrStyle(style);
      const {stringHash} = addSingleCss( query, styles, pseudo);
      pseudo && Object.entries(pseudo).map(([pseudoKey, pseudoStyle]) => {
        const {stringHash: pseudoStringHash} = addPseudoCss(stringHash, query, pseudoKey, pseudoStyle);
        // console.log('pseudoStringHash', `${query}${pseudoKey}`);
        ids = {
          ...ids,
          [key]: `${ids?.[key] ? ids[key] + " " : ""}${pseudoStringHash}`,
        };
      });
      if(!Object.keys(styles).length) return;
      ids = {
        ...ids,
        [key]: `${ids?.[key] ? ids[key] + " " : ""}${stringHash}`,
      };
    });
    cleanStyles = {
      ...cleanStyles,
      [key]: styles,
    }; 
  });

  return { ids, styles: cleanStyles, fullStyles: stylesWithQuery };
};

export default createStyleSheet;

