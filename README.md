<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/bossoq/marketstatistics">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Stock Market Statistics</h3>

  <p align="center">
    A Project to calculate Stock Market Return from Source
    <br />
    <a href="https://github.com/bossoq/marketstatistics"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://setmarketstatistics.herokuapp.com">View Demo</a>
    ·
    <a href="https://github.com/bossoq/marketstatistics/issues">Report Bug</a>
    ·
    <a href="https://github.com/bossoq/marketstatistics/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation & Run</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://setmarketstatistics.herokuapp.com)

This is a hobby project inspired by my jobs (as a financial advisor). Previously, I need to calculate all these values by using Spreadsheets. Now, with this project, I can use theses values for my jobs without any further work!

### Built With

This project use the follow frameworks:

* [Bulma](https://bulma.dev)
* [Oak](https://oakserver.github.io/oak/)
* [Supabase](https://supabase.io)

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* Deno

  ```sh
  curl -fsSL https://deno.land/x/install/install.sh | sh
  ```

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/bossoq/marketstatistics.git
   ```

2. Create Supapbase DB with 3 tables (please see [dbtypes.ts](https://github.com/bossoq/marketstatistics/blob/main/interfaces/dbtypes.ts) for additional info)

   ```sh
   Bond_Yield
   SET_Info
   SET_Return
   ```

3. Prepare Supabase API Key from [Supabase](https://supabase.io)

   ```sh
   export SUPABASEURL={your supabase url}
   export SUPABASEAPI={your supabase api key}
   ```

4. Run Deno

   ```sh
   deno run --location http://localhost --allow-net --allow-read --allow-env --cached-only index.ts
   ```

5. Or Deploy on Heroku with provided Procfile

   ```sh
   # Using Chibat Heroku Buildpack
   heroku create --buildpack https://github.com/chibat/heroku-buildpack-deno.git
   # Setup remote variable / if deploy for local, please use .env file instead
   heroku config:set SUPABASEURL={your supabase url}
   heroku config:set SUPABASEAPI={your supabase api key}
   # Push code to heroku
   git push heroku main
   # Start heroku dyno / or `heroku local web` to start locally
   heroku open
   ```

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/bossoq/marketstatistics/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the Market Statistics, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- CONTACT -->
## Contact

K. Wajakajornrit - [@Bosskun_](https://twitter.com/Bosskun_) - kittipos@picturo.us

Project Link: [https://github.com/bossoq/marketstatistics](https://github.com/bossoq/marketstatistics)

<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [Deno](https://deno.land)
* [Bulma](https://bulma.dev)
* [Oak](https://oakserver.github.io/oak/)
* [Supabase](https://supabase.io)
* [Font Awesome](https://fontawesome.com)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/bossoq/marketstatistics.svg?style=for-the-badge
[contributors-url]: https://github.com/bossoq/marketstatistics/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/bossoq/marketstatistics.svg?style=for-the-badge
[forks-url]: https://github.com/bossoq/marketstatistics/network/members
[stars-shield]: https://img.shields.io/github/stars/bossoq/marketstatistics.svg?style=for-the-badge
[stars-url]: https://github.com/bossoq/marketstatistics/stargazers
[issues-shield]: https://img.shields.io/github/issues/bossoq/marketstatistics.svg?style=for-the-badge
[issues-url]: https://github.com/bossoq/marketstatistics/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/kittiposw
[product-screenshot]: images/screenshot.jpg