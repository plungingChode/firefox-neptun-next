import 'lib/dom'

enum NeptunPage {
  /** Saját adatok > Személyes adatok */ personalData,
  /** Saját adatok > Képzettségek */ personalEducation,
  /** Saját adatok > Elérhetőségek */ personalContact,
  /** Saját adatok > Beállítások */ personalSettings,
  /** Saját adatok > Adatmódosítások */ personalDataModifications,
  /** Bejelentkezés */ login,
  /** Órarend */ timetable,
  /** Leckekönyv */ markbook,
  /** Előrehaladás */ advance,
  /** Tárgyfelvétel */ addSubjects,
  /** Vizsgajelentkezés */ modifyExams,
  /** Felvett vizsgák */ signedExams,
  /** Beérkező üzenetek */ inbox,
  /** Elküldött üzenetek */ outbox
}

const neptunPages: Record<NeptunPage, RegExp> = {
  [NeptunPage.personalData]: /0101/i,
  [NeptunPage.personalEducation]: /0102/i,
  [NeptunPage.personalContact]: /0103/i,
  [NeptunPage.personalSettings]: /0104/i,
  [NeptunPage.personalDataModifications]: /0106/i,
  [NeptunPage.login]: /\/login/i,
  [NeptunPage.timetable]: /0203|c_common_timetable/,
  [NeptunPage.markbook]: /0206|h_markbook/,
  [NeptunPage.advance]: /0222|h_advance/,
  [NeptunPage.addSubjects]: /0303|h_addsubjects/,
  [NeptunPage.modifyExams]: /0401|h_exams/,
  [NeptunPage.signedExams]: /0402|h_signedexams/,
  [NeptunPage.inbox]: /main.aspx$|inbox$/,
  [NeptunPage.outbox]: /outbox$/
}

function isPage(page: NeptunPage, url = window.location.href) {
  return neptunPages[page].test(url)
}

enum NeptunPageGroup {
  /** Saját adatok */ personalData,
  /** Tanulmányok */ studies,
  /** Órarend */ timetable,
  /** Tárgyak */ courses,
  /** Vizsgák */ exams,
  /** Pénzügyek */ finances,
  /** Információ */ information,
  /** Ügyintézés */ administration,
  /** Üzenetek */ mail,
}

// prettier-ignore
const neptunPageGroups: Record<NeptunPageGroup, RegExp> = {
  [NeptunPageGroup.personalData]: /01\d\d/,
  [NeptunPageGroup.studies]: /02\d[0-2|4-9]|(h_adv|h_mar).*/,
  [NeptunPageGroup.timetable]: /0203|(c_comm).*/,
  [NeptunPageGroup.courses]: /03\d\d|(h_add).*/,
  [NeptunPageGroup.exams]: /04\d\d|(h_exa|h_sig).*/,
  [NeptunPageGroup.finances]: /05\d\d/,
  [NeptunPageGroup.information]: /130[135]|131[346]|(c_gen|h_inst|h_fir|c_ele).*/,
  [NeptunPageGroup.administration]: /1311|1307|14\d\d|(h_sca|h_sza|h_app|c_onl).*/,
  [NeptunPageGroup.mail]: /main\.aspx$|inbox|outbox|rules|directory/,
};

function isPageGroup(group: NeptunPageGroup, url = window.location.href) {
  return neptunPageGroups[group].test(url)
}

function isAuthenticated() {
  return !!document.querySelector('#form1')
}

function isNeptunDomain(url = window.location.href) {
  const patterns = [
    /https:\/\/.*neptun.*\/.*hallgato(i)?.*\/.*/i,
    /https:\/\/.*hallgato.*\/.*neptun?.*\/.*/i,
    /https:\/\/.*neptun.*\/.*oktato(i)?.*\/.*/i,
    /https:\/\/.*oktato.*\/.*neptun?.*\/.*/i,
    /https:\/\/netw.*\.nnet\.sze\.hu\/hallgato\/.*/i,
    /https:\/\/nappw\.dfad\.duf\.hu\/hallgato\/.*/i,
    /https:\/\/host\.sdakft\.hu\/.*/i,
    /https:\/\/neptun\.ejf\.hu\/ejfhw\/.*/i,
  ]

  return patterns.some(p => p.test(url))
}

let cachedLang: NeptunLanguage | null = null
type NeptunLanguage = 'hu-HU' | 'en-GB' | 'de-DE'
function getPageLanguage(): NeptunLanguage {
  if (cachedLang) {
    return cachedLang
  }
  
  const buttons = $$('[id^=btnLang_')
  const isActive = (el: HTMLElement) => {
    return getComputedStyle(el).opacity === '1'
  }
  for (const btn of buttons) {
    if (!isActive(btn)) {
      continue
    }
    switch (btn.title.toLowerCase()) {
      case 'magyar':
        cachedLang = 'hu-HU'
        break
      case 'english':
        cachedLang = 'en-GB'
        break
      case 'deutsch':
        cachedLang = 'de-DE'
        break
    }
  }

  if (!cachedLang) {
    cachedLang = 'hu-HU'
  }
  return cachedLang
}

export {
  isPage,
  NeptunPage,
  isPageGroup,
  NeptunPageGroup,
  isAuthenticated,
  isNeptunDomain,
  NeptunLanguage,
  getPageLanguage,
}
