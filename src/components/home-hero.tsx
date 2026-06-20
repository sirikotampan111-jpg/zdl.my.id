      {/* Subtle warm radial accent only — no full-bg photo overlay */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-gold/[0.06] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-gradient-to-tr from-gold/[0.04] via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left content — 6 cols */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Eyebrow */}
              <div className="zheng-badge">
                <Shield className="w-3.5 h-3.5" />
                Zheng Digital Studio
              </div>

              {/* H1 */}
              <h1 className="heading-serif text-4xl sm:text-5xl md:text-[3.25rem] lg:text-6xl leading-[1.08] text-foreground">
                Jasa Pembuatan Website{" "}
                <span className="zheng-mark">Terjamin</span>
                <br />
                <span className="text-gold">&amp;</span> Anti-Scam
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-foreground/80 max-w-xl leading-relaxed">
                Kami memahami risiko mempercayakan website bisnis Anda kepada orang lain.{" "}
                <strong className="text-foreground">Zheng Digital Studio</strong> hadir sebagai solusi —{" "}
                jasa pembuatan website dengan{" "}
                <span className="hand-underline">garansi uang kembali</span> dan proses yang transparan.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <Button
                size="lg"
                asChild
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-lg px-7 h-12"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Konsultasi Gratis
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigateTo("portofolio", setCurrentPage, router)}
                className="border-border text-foreground hover:bg-foreground hover:text-background rounded-lg px-7 h-12"
              >
                Lihat Portofolio
              </Button>
            </motion.div>
          </div>
