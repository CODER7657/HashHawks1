import React, { useEffect, useRef } from 'react';
import { ChevronDown, Github, Linkedin, Globe, ArrowRight, Zap, Shield, Layers, Cpu, Palette, Cloud, Brain, Lock, Code, Database } from 'lucide-react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Neural Network Animation with Light Purple Theme
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
    const pointer = { x: 0, y: 0, tX: 0, tY: 0 };
    let uniforms: any;

    const vertShaderSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
        vUv = .5 * (a_position + 1.);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragShaderSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform float u_scroll_progress;
      
      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }
      
      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.);
        vec2 res = vec2(0.);
        float scale = 8.;
        
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.);
          sine_acc = rotate(sine_acc, 1.);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (.5 + .5 * cos(layer)) / scale;
          scale *= (1.2);
        }
        return res.x + res.y;
      }
      
      void main() {
        vec2 uv = .5 * vUv;
        uv.x *= u_ratio;
        
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0., 1.);
        p = .5 * pow(1. - p, 2.);
        
        float t = .001 * u_time;
        vec3 color = vec3(0.);
        
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.);
        noise += pow(noise, 10.);
        noise = max(.0, noise - .5);
        noise *= (1. - length(vUv - .5));
        
        // Light purple color palette
        color = vec3(0.616, 0.306, 0.867); // #9D4EDD
        color += vec3(0.780, 0.490, 1.0) * sin(3.0 * u_scroll_progress + 1.5); // #C77DFF
        color = color * noise;
        
        gl_FragColor = vec4(color, noise);
      }
    `;

    function createShader(gl: WebGLRenderingContext, sourceCode: string, type: number) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, sourceCode);
      gl.compileShader(shader);
      return shader;
    }

    function initShader() {
      const vertexShader = createShader(gl, vertShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = createShader(gl, fragShaderSource, gl.FRAGMENT_SHADER);
      
      if (!vertexShader || !fragmentShader) return;

      const shaderProgram = gl.createProgram();
      if (!shaderProgram) return;

      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      uniforms = getUniforms(shaderProgram);

      function getUniforms(program: WebGLProgram) {
        const uniforms: any = {};
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
          const uniformInfo = gl.getActiveUniform(program, i);
          if (uniformInfo) {
            uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name);
          }
        }
        return uniforms;
      }

      const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.useProgram(shaderProgram);

      const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    function render() {
      const currentTime = performance.now();
      pointer.x += (pointer.tX - pointer.x) * 0.2;
      pointer.y += (pointer.tY - pointer.y) * 0.2;

      gl.uniform1f(uniforms.u_time, currentTime);
      gl.uniform2f(uniforms.u_pointer_position, pointer.x / window.innerWidth, 1 - pointer.y / window.innerHeight);
      gl.uniform1f(uniforms.u_scroll_progress, window.pageYOffset / (document.body.scrollHeight - window.innerHeight));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function setupEvents() {
      const updateMousePosition = (x: number, y: number) => {
        pointer.tX = x;
        pointer.tY = y;
      };

      window.addEventListener("pointermove", (e) => updateMousePosition(e.clientX, e.clientY));
      window.addEventListener("touchmove", (e) => updateMousePosition(e.touches[0].clientX, e.touches[0].clientY));
      window.addEventListener("click", (e) => updateMousePosition(e.clientX, e.clientY));
    }

    initShader();
    setupEvents();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    render();

    // Purple Grid Animation for About Section
    const gridCanvas = gridCanvasRef.current;
    if (gridCanvas) {
      const ctx = gridCanvas.getContext('2d');
      if (ctx) {
        let animationId: number;

        function drawGrid() {
          const width = gridCanvas.width;
          const height = gridCanvas.height;
          
          ctx.clearRect(0, 0, width, height);
          
          const gridSize = 40;
          const time = Date.now() * 0.001;
          
          // Create gradient for depth effect with purple tones
          const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
          gradient.addColorStop(0, 'rgba(157, 78, 221, 0.8)'); // #9D4EDD
          gradient.addColorStop(0.5, 'rgba(199, 125, 255, 0.4)'); // #C77DFF
          gradient.addColorStop(1, 'rgba(224, 170, 255, 0.1)'); // #E0AAFF
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          
          // Draw vertical lines
          for (let x = 0; x <= width; x += gridSize) {
            const pulse = Math.sin(time + x * 0.01) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          
          // Draw horizontal lines
          for (let y = 0; y <= height; y += gridSize) {
            const pulse = Math.sin(time + y * 0.01) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
          
          animationId = requestAnimationFrame(drawGrid);
        }

        function resizeGridCanvas() {
          gridCanvas.width = window.innerWidth;
          gridCanvas.height = window.innerHeight;
          drawGrid();
        }

        resizeGridCanvas();
        window.addEventListener('resize', resizeGridCanvas);

        return () => {
          cancelAnimationFrame(animationId);
          window.removeEventListener('resize', resizeGridCanvas);
        };
      }
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-dark to-purple-darker text-white font-sans overflow-x-hidden">
      {/* Neural Network Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ display: 'block' }}
      />

      {/* Premium Glassmorphism Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-12 py-4 rounded-full glass-nav shadow-2xl">
        <div className="flex space-x-10">
          {['Home', 'About', 'Team', 'Projects', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="relative group text-white/90 hover:text-purple-light transition-all duration-300 font-medium tracking-wide text-lg"
            >
              <span className="relative z-10">{item}</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-primary to-purple-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="absolute inset-0 bg-purple-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        <div className="space-y-8">
          <h1 className="text-7xl md:text-9xl font-black tracking-tight">
            <span className="hashhawks-logo drop-shadow-2xl">
              HashHawks
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            Engineering Tomorrow's Digital Reality
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center mt-12">
            <button
              onClick={() => scrollToSection('about')}
              className="group relative px-8 py-4 glass-button rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Discover Our Vision
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button
              onClick={() => scrollToSection('projects')}
              className="group relative px-8 py-4 glass-button-outline rounded-full font-semibold text-purple-light transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                View Our Work
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        <button
          onClick={() => scrollToSection('about')}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-purple-light hover:text-purple-primary transition-colors animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* About Section with Purple Grid Background */}
      <section id="about" className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Grid Background Canvas */}
        <canvas
          ref={gridCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
        
        {/* Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-purple-dark/20 to-purple-darker/80 z-5"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="glass-container rounded-3xl p-12 space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-6xl font-black">
                <span className="text-purple-light">About</span>
                <span className="text-white"> HashHawks</span>
              </h2>
              
              <div className="w-24 h-1 bg-gradient-to-r from-purple-primary to-purple-light rounded-full mx-auto"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Main Content */}
              <div className="space-y-6">
                <p className="text-xl text-gray-200 leading-relaxed">
                  With <span className="text-purple-light font-semibold">1 year of intensive expertise</span> in cutting-edge technologies, 
                  HashHawks represents the next generation of digital innovators. Our multidisciplinary team combines 
                  deep technical knowledge with visionary thinking across cybersecurity, AI/ML, blockchain, and automation.
                </p>
                
                <p className="text-lg text-gray-300 leading-relaxed">
                  We don't just build software - we engineer digital ecosystems that transform ideas into revolutionary products.
                </p>
              </div>

              {/* Right Column - Expertise Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Lock, title: 'Cybersecurity & Ethical Hacking', desc: 'Advanced threat detection and security solutions' },
                  { icon: Layers, title: 'Blockchain & Web3 Development', desc: 'Decentralized applications and smart contracts' },
                  { icon: Brain, title: 'AI/ML Integration', desc: 'Intelligent systems and generative AI solutions' },
                  { icon: Zap, title: 'N8N Workflow Automation', desc: 'Seamless API integrations and process automation' },
                  { icon: Code, title: 'Full-Stack Development', desc: 'End-to-end web and mobile applications' },
                  { icon: Database, title: 'DApp Architecture', desc: 'User-friendly decentralized application interfaces' }
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="group relative p-4 glass-card rounded-2xl transition-all duration-500 hover:transform hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative z-10 space-y-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-primary to-purple-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-light transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative min-h-screen flex flex-col items-center justify-center py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Meet the <span className="text-purple-light">Hawks</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Elite digital architects pushing the boundaries of what's possible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { 
                name: 'Pavan Patel', 
                role: 'Cybersecurity & Blockchain Lead', 
                initial: 'P', 
                color: 'from-purple-primary to-purple-light',
                education: ['BS Computer Science at BITS PILANI', 'BTech CSE(DS) at NEW LJIET'],
                skills: ['Python', 'JavaScript', 'Wireshark', 'Metasploit', 'Hardhat', 'ethers.js', 'Kali Linux', 'React.js', 'Network Security'],
                bio: 'Passionate cybersecurity expert and blockchain developer. Specializes in DApp development and ethical hacking. Active in cybersecurity clubs and hackathons.',
                portfolio: 'myselfpavan.vercel.app',
                linkedin: 'https://www.linkedin.com/in/pavan-patel-559195261/',
                hasPortfolio: true
              },
              { 
                name: 'Ayush Bawaskar', 
                role: 'AI/ML & Frontend Specialist', 
                initial: 'A', 
                color: 'from-purple-light to-purple-accent',
                education: ['BTech CSE(AIML) at NEW LJIET'],
                skills: ['React.js', 'ethers.js', 'Blockchain', 'Team Leadership', 'AI/ML'],
                bio: 'AI/ML enthusiast exploring the intersection of artificial intelligence and decentralized technologies. Expert in building DApp frontends with React.js.',
                portfolio: null,
                linkedin: 'https://www.linkedin.com/in/ayush-bawaskar-254322340/',
                hasPortfolio: false
              },
              { 
                name: 'Hem Patel', 
                role: 'Web3 & DApp Developer', 
                initial: 'H', 
                color: 'from-purple-accent to-purple-primary',
                education: ['CSE at N.L.J. Institute of Engineering and Technology'],
                skills: ['React.js', 'Ethers.js', 'Modern Web Development', 'Responsive Design'],
                bio: 'Web3 developer passionate about building purpose-driven DApps. Creates seamless blockchain interfaces with modern web technologies.',
                portfolio: null,
                linkedin: 'https://www.linkedin.com/in/hem-patel-02b215377/',
                hasPortfolio: false
              },
              { 
                name: 'Jay Prajapati', 
                role: 'Backend & AI Integration Specialist', 
                initial: 'J', 
                color: 'from-purple-primary to-purple-accent',
                education: ['BTech at NEW LJIET'],
                skills: ['RESTful APIs', 'Cloud Deployments', 'Microservices', 'N8N Automation', 'AI Models'],
                bio: 'Backend architect specializing in AI-powered solutions. Expert in building scalable systems with intelligent automation workflows.',
                portfolio: null,
                linkedin: 'https://www.linkedin.com/in/jay-prajapati-00a344357/',
                hasPortfolio: false
              }
            ].map((member, index) => (
              <div
                key={member.name}
                className="group relative glass-container rounded-3xl p-8 transition-all duration-500 hover:transform hover:scale-105"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative z-10 space-y-6">
                  <div className="text-center space-y-4">
                    <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-2xl font-black text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {member.initial}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                      <p className="text-purple-light font-medium text-lg">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-purple-light mb-2">Education</h4>
                      {member.education.map((edu, i) => (
                        <p key={i} className="text-xs text-gray-300">{edu}</p>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-purple-light mb-2">Key Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-purple-primary/20 border border-purple-primary/30 rounded-full text-xs text-purple-light font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 4 && (
                          <span className="px-2 py-1 bg-purple-primary/20 border border-purple-primary/30 rounded-full text-xs text-purple-light font-medium">
                            +{member.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-4 pt-4">
                    {member.hasPortfolio ? (
                      <a
                        href={`https://${member.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white hover:scale-105 transition-all duration-300"
                      >
                        <Globe className="w-4 h-4 inline mr-2" />
                        Portfolio
                      </a>
                    ) : (
                      <button
                        disabled
                        className="glass-button-disabled px-4 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                      >
                        <Globe className="w-4 h-4 inline mr-2" />
                        Portfolio Coming Soon
                      </button>
                    )}
                    
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 glass-button rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300"
                    >
                      <Linkedin className="w-5 h-5 text-purple-light" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative min-h-screen flex flex-col items-center justify-center py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Our <span className="text-purple-light">Creations</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Digital masterpieces that redefine industry standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'NeuroSync Platform', desc: 'AI-powered neural interface for enterprise automation', tech: 'React, WebGL, TensorFlow' },
              { title: 'CyberVault Security', desc: 'Next-generation blockchain security infrastructure', tech: 'Solidity, Node.js, Redis' },
              { title: 'QuantumFlow Analytics', desc: 'Real-time data visualization with quantum algorithms', tech: 'D3.js, Python, WebAssembly' }
            ].map((project, index) => (
              <div
                key={project.title}
                className="group relative glass-container rounded-3xl overflow-hidden transition-all duration-500 hover:transform hover:scale-105"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Project Image Placeholder */}
                <div className="relative h-64 bg-gradient-to-br from-purple-dark to-purple-darker overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/20 to-purple-light/20 group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl font-black text-white/10 group-hover:text-purple-light/20 transition-colors duration-500">
                      {index + 1}
                    </div>
                  </div>
                </div>
                
                <div className="relative z-10 p-8 space-y-4">
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-light transition-colors duration-300">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {project.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.split(', ').map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-purple-primary/20 border border-purple-primary/30 rounded-full text-xs text-purple-light font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <button className="group/btn flex items-center gap-2 text-purple-light hover:text-white font-semibold transition-colors duration-300">
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative min-h-screen flex flex-col items-center justify-center py-20 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Get in <span className="text-purple-light">Touch</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ready to transform your digital presence? Let's create something extraordinary together.
            </p>
          </div>

          <div className="glass-container rounded-3xl p-12">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-light">Name</label>
                  <input
                    type="text"
                    className="glass-input w-full rounded-xl py-4 px-6 text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Your Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-light">Email</label>
                  <input
                    type="email"
                    className="glass-input w-full rounded-xl py-4 px-6 text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-light">Project Type</label>
                <select className="glass-input w-full rounded-xl py-4 px-6 text-white transition-all duration-300">
                  <option value="">Select Project Type</option>
                  <option value="web-app">Web Application</option>
                  <option value="mobile-app">Mobile Application</option>
                  <option value="blockchain">Blockchain Solution</option>
                  <option value="ai-ml">AI/ML Integration</option>
                  <option value="consulting">Technical Consulting</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-light">Project Details</label>
                <textarea
                  rows={6}
                  className="glass-input w-full rounded-xl py-4 px-6 text-white placeholder-gray-400 transition-all duration-300 resize-none"
                  placeholder="Tell us about your vision..."
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="group relative px-12 py-4 glass-button rounded-full font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Launch Project
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-purple-primary/20 glass-footer py-12 px-6 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-black hashhawks-logo">
              HashHawks
            </h3>
            <p className="text-gray-300 mt-2">Engineering Tomorrow's Digital Reality</p>
          </div>
          
          <div className="flex justify-center space-x-8 mb-8">
            {[Github, Linkedin, Globe].map((Icon, i) => (
              <button
                key={i}
                className="w-12 h-12 glass-button rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300"
              >
                <Icon className="w-6 h-6 text-purple-light" />
              </button>
            ))}
          </div>
          
          <div className="text-gray-400 text-sm">
            © 2025 HashHawks. All rights reserved. | Engineered with precision and passion.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;