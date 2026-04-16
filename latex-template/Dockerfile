FROM texlive/texlive:latest-small

WORKDIR /doc

# Install additional LaTeX packages needed for the CV
# multicol is part of 'tools' (already in base image)
RUN tlmgr install \
    fontawesome5 \
    fancyhdr \
    titlesec \
    enumitem \
    etoolbox \
    multirow \
    ragged2e \
    microtype \
    hyperref \
    parskip \
    xcolor \
    pgf \
    graphics \
    tools \
    amsmath \
    eurosym \
    lm \
    inter \
    montserrat \
    fontaxes \
    mweights \
    ly1 \
    cbfonts \
    greek-fontenc \
    needspace \
    && texhash

COPY cv-style.sty .
COPY cv-personal-header.tex .
COPY cv-timeline-section.tex .
COPY cv-skills-section.tex .
COPY cv.tex .
COPY profile-image.jpg .

CMD ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", "cv.tex"]
