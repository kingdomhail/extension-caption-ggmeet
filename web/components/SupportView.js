import { SiteChrome } from "@/components/SiteChrome"
import { RichText } from "@/components/RichText"
import { AUTHOR, EMAIL } from "@/lib/site"
import { supportCopy } from "@/lib/support-content"

const mailHref = `mailto:${EMAIL}?subject=Captions%20Recorder%20for%20Google%20Meet%20%E2%80%94%20Support`

export function SupportView({ lang }) {
  const t = supportCopy[lang]
  return (
    <SiteChrome lang={lang} page="support">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p className="lede">{t.lede}</p>
        </div>
      </section>

      <section className="section" id="start">
        <div className="wrap">
          <div className="section-head">
            <h2>{t.useTitle}</h2>
          </div>
          <ol className="steps">
            {t.steps.map(([title, body], index) => (
              <li key={title}>
                <span className="step-no">{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="status">
        <div className="wrap">
          <div className="section-head">
            <h2>{t.statusTitle}</h2>
            <p>{t.statusIntro}</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {t.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row) => (
                  <tr key={row.codes[1]}>
                    <td>
                      <code>{row.codes[0]}</code>
                      <br />
                      <code>{row.codes[1]}</code>
                    </td>
                    <td>
                      <RichText text={row.meaning} />
                    </td>
                    <td>
                      {row.action ? (
                        row.action
                      ) : (
                        <>
                          {row.actionBefore}
                          <a href="https://meet.google.com/" target="_blank" rel="noopener noreferrer">
                            meet.google.com
                          </a>
                          {row.actionAfter}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head">
            <h2>{t.faqTitle}</h2>
          </div>
          <div className="faq">
            {t.faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <div className="faq-body">
                  {item.a?.map((paragraph) => (
                    <p key={paragraph}>
                      <RichText text={paragraph} />
                    </p>
                  ))}
                  {item.list ? (
                    <ul>
                      {item.list.map((entry) => (
                        <li key={entry}>
                          <RichText text={entry} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="wrap">
          <div className="section-head">
            <h2>{t.contactTitle}</h2>
            <p>{t.contactBody}</p>
          </div>
          <div className="contact">
            <div>
              <h3>{AUTHOR}</h3>
              <p>{EMAIL}</p>
            </div>
            <a className="btn btn-primary" href={mailHref}>
              {t.contactButton}
            </a>
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
