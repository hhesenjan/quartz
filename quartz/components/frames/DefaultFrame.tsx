import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
import { ArticleContents } from "../ArticleContents"

const Header = HeaderConstructor()

/**
 * The default page frame — three-column layout with left sidebar, center
 * content (header + body + afterBody), and right sidebar, followed by a footer.
 *
 * This is the original Quartz layout, extracted from renderPage.tsx.
 */
export const DefaultFrame: PageFrame = {
  name: "default",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer,
  }: PageFrameProps) {
    return (
      <>
        <a href="#main-content" class="skip-to-content" data-router-ignore>
          Skip to main content
        </a>
        <aside class="left sidebar" aria-label="Site navigation">
          {left.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </aside>
        <main class="center" id="main-content" tabIndex={-1}>
          <div class="page-header">
            <Header {...componentData}>
              {header.map((HeaderComponent) => (
                <HeaderComponent {...componentData} />
              ))}
            </Header>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => (
                <BodyComponent {...componentData} />
              ))}
            </div>
            <ArticleContents {...componentData} />
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </main>
        <aside class="right sidebar" aria-label="Page navigation">
          {right.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </aside>
        {footer.map((FooterComponent) => (
          <FooterComponent {...componentData} />
        ))}
      </>
    )
  },
}
