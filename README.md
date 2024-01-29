# Requirements

### Non-functional

- mobile responsive
- accessibility best practices (WCAG)
- pleasant user experience
  - clear communication
  - intentional design

### Functional

- can submit information, including an image
  - exhibition name, company name, presenter name, presenter email, logo, description
  - save information to local storage

# The Code

**Focus**: The focus of this code was functionality aimed at providing a unique and pleasant user experience.

**Data Validation**: Light data validation has been done for input fields, primarily through HTML. Further validation can be done with stricter requirements.

**Data Sanitization**: Data sanitization should be done on the back end, which this application does not have. Rest assured, I will not blindly insert data into a database and fall victim to SQL injection attacks.

**Readability**: I tried my best to make my code readable and self-documenting, but felt stunted by the limitation of one .js file. I would have liked to do more with modularity and code splitting. That extends to CSS, too; I'd much prefer using a preprocessor like SaSS to enhance the readability and developer experience.

**Final Note**: I'm most familiar with building UIs in React and leveraging reusable components and component libraries, as well as stateful logic to inform rerendering of the DOM. This was a fun challenge!

# How to run

Simply visit [this preview site](https://htmlpreview.github.io/?https://github.com/kmccracko/ativ-challenge/blob/main/project.html).
