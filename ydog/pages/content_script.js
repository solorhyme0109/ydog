
function Singleton() {
  let popup
  return class Popup {
    constructor() {
      if (popup) {
        popup._init()
        return popup
      }
      popup = this
      popup._init()
    }
    _init() {
      if(this.element) {
        return
      }
      const element = document.createElement('div')
      const popupStyle = {
        position: 'fixed',
        right: '0px',
        top: '0px',
        width: '360px',
        maxHeight: '400px',
        minHeight: '140px',
        backgroundColor: '#fff',
        boxShadow: 'rgba(173, 197, 229, 0.6) -2px 2px 4px 0px',
        zIndex: 9999
      }
      Object.keys(popupStyle).forEach((k) => {
        element.style[k] = popupStyle[k]
      })
      element.innerHTML = `
        <div id="__ydog_header"
          style="
            padding: 0 8px;
            height: 30px;
            border-bottom: 1px solid #dfdfdf;">
          <div style="
            color:#3696cd;
            height: 100%;
            line-height: 30px;
            float:left">Ydog</div>
          <div id="__ydog_close_btn" style="
            cursor: pointer;
            height: 100%;
            line-height: 30px;
            float:right">X</div>
        </div>
        <div id="__ydog_body" style="
         position: relative;
         min-height: 110px;
        ">
          hello
        </div>
      `
      this.element = element
      document.body.appendChild(this.element)
      function cb(e) {
        if (e.path.indexOf(popup.element) === -1) {
          popup.destroy()
          document.body.removeEventListener('click', cb)
        }
      }
      this.element.querySelector('#__ydog_close_btn').addEventListener('click', (e) => {
        e.stopPropagation()
        this.destroy()
        document.body.removeEventListener('click', cb)
      })
      document.body.addEventListener('click', cb)
    }
    setLoading() {
      const body = this.element.querySelector('#__ydog_body')
      body.innerHTML = `
        <div style="
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          width:100px;
          height: 30px;
          text-align:center;">
          加载中...
        </div>
      `
    }
    setResult(result) {
      const ukPhonetic = result.basic && result.basic['uk-phonetic']
                         ? `<span style="margin-right: 6px;">
                         英式发音
                         <span>[${result.basic['uk-phonetic']}]</span>
                       </span>`
                       : ''
      const usPhonetic = result.basic && result.basic['us-phonetic']
                          ? `<span>
                          美式发音
                          <span>[${result.basic['us-phonetic']}]</span>
                        </span>`
                        : ''
      const phonetic = result.basic && result.basic.phonetic && !result.basic['uk-phonetic']
                        ? `<span style="margin-right: 6px;">
                        发音
                        <span>[${result.basic.phonetic}]</span>
                      </span>`
                      : ''
      const body = this.element.querySelector('#__ydog_body')
      body.innerHTML = `
        <div id="__ydog_basic_explain">
          <div style="
            padding: 6px 10px;
            color: #797C7d;
            margin-right: 10px;
            font-size: 12px;">
            <span style="
            font-size: 18px;
            font-weight: bold;
            margin-right: 14px;
            color: #333;
            ">${result.query}</span>
            <br />
            ${phonetic}
            ${ukPhonetic}
            ${usPhonetic}
          </div>
          <ul style="
            margin: 0;
            padding: 0 10px;
            font-size: 12px;
          ">
            ${result.basic && result.basic.explains.map((r) => {
              return `
                <li style="
                  line-height: 1.5;
                  list-style: none;">${r}</li>
              `
            }).join('') || ''}
          </ul>
        <div>
        <div id="__ydog_moreover_explain">
          <div style="
            color: #333;
            font-weight: bold;
            margin: 22px 10px 0;">译文:</div>
          <ul style="
            margin: 0;
            padding: 6px 10px;
            font-size: 12px;
          ">
            ${result.translation && result.translation.map((r) => {
              return `
                <li style="
                  line-height: 1.5;
                  list-style: none;">${r}</li>
              `
            }).join('') || ''}
          </ul>
        </div>
      `
    }
    destroy() {
      this.element.remove()
      this.element = null
    }
  }
}

const Popup = Singleton()

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const {body, status} = request
  const popup = new Popup()
  if (status === 'fetching') {
    popup.setLoading()
  } else if (status === 'finished') {
    popup.setResult(body)
  }
})
