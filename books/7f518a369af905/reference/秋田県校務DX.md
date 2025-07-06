# Akita Prefecture Next-Generation School Administration DX Platform Project – Comprehensive Report

<!-- Copilot-Researcher-Visualization -->
```html
<style>
    :root {
        --accent: #464feb;
        --timeline-ln: linear-gradient(to bottom, transparent 0%, #b0beff 15%, #b0beff 85%, transparent 100%);
        --timeline-border: #ffffff;
        --bg-card: #f5f7fa;
        --bg-hover: #ebefff;
        --text-title: #424242;
        --text-accent: var(--accent);
        --text-sub: #424242;
        --radius: 12px;
        --border: #e0e0e0;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        --hover-shadow: 0 4px 14px rgba(39, 16, 16, 0.1);
        --font: "Segoe UI";
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --accent: #7385ff;
            --timeline-ln: linear-gradient(to bottom, transparent 0%, transparent 3%, #6264a7 30%, #6264a7 50%, transparent 97%, transparent 100%);
            --timeline-border: #424242;
            --bg-card: #1a1a1a;
            --bg-hover: #2a2a2a;
            --text-title: #ffffff;
            --text-sub: #ffffff;
            --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            --hover-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
            --border: #3d3d3d;
        }
    }

    @media (prefers-contrast: more),
    (forced-colors: active) {
        :root {
            --accent: ActiveText;
            --timeline-ln: ActiveText;
            --timeline-border: Canvas;
            --bg-card: Canvas;
            --bg-hover: Canvas;
            --text-title: CanvasText;
            --text-sub: CanvasText;
            --shadow: 0 2px 10px Canvas;
            --hover-shadow: 0 4px 14px Canvas;
            --border: ButtonBorder;
        }
    }

    .insights-container {
        display: grid;
        grid-template-columns: repeat(2,minmax(240px,1fr));
        padding: 0px 16px 0px 16px;
        gap: 16px;
        margin: 0 0;
        font-family: var(--font);
    }

    .insight-card:last-child:nth-child(odd){
        grid-column: 1 / -1;
    }

    .insight-card {
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        min-width: 220px;
        padding: 16px 20px 16px 20px;
    }

    .insight-card:hover {
        background-color: var(--bg-hover);
    }

    .insight-card h4 {
        margin: 0px 0px 8px 0px;
        font-size: 1.1rem;
        color: var(--text-accent);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .insight-card .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 1.1rem;
        color: var(--text-accent);
    }

    .insight-card p {
        font-size: 0.92rem;
        color: var(--text-sub);
        line-height: 1.5;
        margin: 0px;
    }

    .insight-card p b, .insight-card p strong {
        font-weight: 600;
    }

    .metrics-container {
        display:grid;
        grid-template-columns:repeat(2,minmax(210px,1fr));
        font-family: var(--font);
        padding: 0px 16px 0px 16px;
        gap: 16px;
    }

    .metric-card:last-child:nth-child(odd){
        grid-column:1 / -1; 
    }

    .metric-card {
        flex: 1 1 210px;
        padding: 16px;
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric-card:hover {
        background-color: var(--bg-hover);
    }

    .metric-card h4 {
        margin: 0px;
        font-size: 1rem;
        color: var(--text-title);
        font-weight: 600;
    }

    .metric-card .metric-card-value {
        margin: 0px;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-accent);
    }

    .metric-card p {
        font-size: 0.85rem;
        color: var(--text-sub);
        line-height: 1.45;
        margin: 0;
    }

    .timeline-container {
        position: relative;
        margin: 0 0 0 0;
        padding: 0px 16px 0px 56px;
        list-style: none;
        font-family: var(--font);
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: calc(-40px + 56px);
        width: 2px;
        height: 100%;
        background: var(--timeline-ln);
    }

    .timeline-container > li {
        position: relative;
        margin-bottom: 16px;
        padding: 16px 20px 16px 20px;
        border-radius: var(--radius);
        background: var(--bg-card);
        border: 1px solid var(--border);
    }

    .timeline-container > li:last-child {
        margin-bottom: 0px;
    }

    .timeline-container > li:hover {
        background-color: var(--bg-hover);
    }

    .timeline-container > li::before {
        content: "";
        position: absolute;
        top: 18px;
        left: -40px;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: var(--timeline-border) 2px solid;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0px 0px 2px 0px #00000012, 0px 4px 8px 0px #00000014;
    }

    .timeline-container > li h4 {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
    }

    .timeline-container > li * {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container > li * b, .timeline-container > li * strong {
        font-weight: 600;
    }

    @media (max-width:600px){
      .metrics-container,
      .insights-container{
        grid-template-columns:1fr;
      }
    }
</style>
<div class="insights-container">
  <div class="insight-card">
    <h4>Transforming School Administration in Akita</h4>
    <p>Akita Prefecture is pioneering a cloud-based, integrated school administration platform to reduce teacher workload and modernize educational management. This “Next-Generation School Administration DX” project is a national pilot aiming to unify systems, enable remote access, and free up teachers’ time for students.</p>
  </div>
</div>
```

## Project Overview and Background  
**Akita Prefecture’s Next-Generation School Administration DX Platform Project** is a groundbreaking initiative to digitally transform school administrative work (“校務DX”) across all public elementary and junior high schools in Akita. Launched in 2023 as part of a Ministry of Education, Culture, Sports, Science and Technology (MEXT) pilot, the project’s core goal is to modernize school administration through cloud technology and improve teachers’ work conditions[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Akita was *selected by MEXT as a demonstration field* (alongside Yamaguchi Prefecture) to develop a **model case for “next-generation” school administration** at a prefecture-wide scale[1](https://jichitai.works/article/details/2877)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html). This aligns closely with Japan’s **educational policy objectives** – notably the GIGA School Program and teacher workstyle reforms – by leveraging ICT to reduce burdens on educators and enhance the quality of education[1](https://jichitai.works/article/details/2877)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html).  

### Goals and Scope  
The **main goals** of the project are:  

1. **Digitize and integrate school administrative systems:** Replace fragmented, paper-based or on-premises systems with a single **cloud-based platform** accessible anywhere[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). This integrated platform covers student records, grading, attendance, faculty HR tasks, communication, and more – creating a unified **“integrated school affairs system”** for all schools in the prefecture[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877).  

2. **Enable flexible, remote work for teachers (Location-Free admin):** Allow teachers and staff to securely access school administrative tools from outside the school (e.g. from home or on business trips) via the internet[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Previously, nearly all school admin work in Japan could only be done on a *school office PC on a closed network*. This project’s *zero-trust security* and cloud design make **“anywhere, one-device” work** possible, supporting teacher telework and work-life balance[1](https://jichitai.works/article/details/2877)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1).  

3. **Reduce teacher workloads and administrative burdens:** Streamline routine tasks (attendance logs, grade input, forms, etc.) through automation and centralized data. By **eliminating time-consuming analog processes** (printing, stamping, faxing, double data entry), the project frees teachers to focus more on students and instruction[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). A key success metric is securing *more time for each student* by cutting paperwork[1](https://jichitai.works/article/details/2877).  

4. **Standardize and unify processes across all schools:** As a **prefecture-wide** initiative, the project involves **joint procurement and usage by every municipality** in Akita[1](https://jichitai.works/article/details/2877). This broad scope ensures that all 25 city/town Boards of Education (who manage local schools) adopt the *same platform and processes*. Standardizing forms, reports, and workflows across the prefecture improves efficiency and eases transitions – for example, when students transfer or teachers rotate between schools, data flows smoothly without re-entry[1](https://jichitai.works/article/details/2877).  

5. **Enhance data use and decision-making:** Implement a centralized **education data dashboard** that integrates administrative data (the “校務系” systems) with learning data (the “学習系” systems). This dashboard provides multi-level visibility – from individual student profiles up to aggregated school and district analytics – enabling early identification of students needing support and data-driven policy decisions[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[1](https://jichitai.works/article/details/2877).  

6. **Strengthen security with modern cloud infrastructure:** Transition from isolated school networks to a robust **Zero-Trust security model**. All teacher accounts are managed under a single Azure Active Directory (Entra ID) tenant for the prefecture, with multi-factor authentication, endpoint management, and data protection enforced uniformly[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[1](https://jichitai.works/article/details/2877). The goal is to protect sensitive educational data while still maintaining usability for staff.  

**Project Scope:** The project spans **all public compulsory education schools in Akita Prefecture** (elementary, junior high, and combined K-9 schools). Initial implementation focused on a pilot group of 7 municipalities in 2023–2024, with plans to onboard the remaining municipalities in phases through 2025–2028[1](https://jichitai.works/article/details/2877). In total, the unified system will serve **~270 schools and their administrative offices** once fully rolled out (covering every city, town, and village in Akita)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This comprehensive scope – **prefecture-wide joint utilization** – is an ambitious aspect; it means the project isn’t just a local pilot but a template for scaling to an entire region[1](https://jichitai.works/article/details/2877). 

### Key Stakeholders  
This DX platform project involves a multi-tiered set of stakeholders:  

- **Ministry of Education (MEXT):** Initiator and funder of the pilot. MEXT’s *School Digital Transformation Project Team* commissioned Akita to conduct this demonstration as part of the national strategy to reform teacher workstyles and modernize school operations[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). MEXT provides oversight, guidance (e.g. updated policy guidelines on school DX), and expects regular progress reports and outcomes data from Akita[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877).  

- **Akita Prefectural Board of Education:** The lead implementer. The Prefecture’s Compulsory Education Division set up a dedicated project team in late 2022 to plan and drive this initiative[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). They coordinate across all municipalities, making decisions on requirements, standardizing forms and rules, and ensuring the project meets local needs. Akita’s team, led by the compulsory education section chief, provides **strong top-down leadership**, effectively acting as the “project owner” to achieve overall optimization for the prefecture[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). They also chair committees to evaluate progress and address issues (e.g. an **Implementation Steering Committee** with local reps and external experts)[4](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%99%29%e3%82%b9%e3%82%bf%e3%83%87%e3%82%a3%e3%82%b5%e3%83%97%e3%83%aa%e3%83%a9%e3%83%9c/Attachments/%e3%80%90%e7%a7%8b%e7%94%b0%e7%9c%8c%e3%80%91%ef%bc%88%e5%88%a5%e6%b7%bb%e6%a7%98%e5%bc%8f%ef%bc%92%ef%bc%8d%ef%bc%92%ef%bc%89%e4%bc%81%e7%94%bb%e6%8f%90%e6%a1%88%e6%9b%b8.pdf?web=1)[4](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%99%29%e3%82%b9%e3%82%bf%e3%83%87%e3%82%a3%e3%82%b5%e3%83%97%e3%83%aa%e3%83%a9%e3%83%9c/Attachments/%e3%80%90%e7%a7%8b%e7%94%b0%e7%9c%8c%e3%80%91%ef%bc%88%e5%88%a5%e6%b7%bb%e6%a7%98%e5%bc%8f%ef%bc%92%ef%bc%8d%ef%bc%92%ef%bc%89%e4%bc%81%e7%94%bb%e6%8f%90%e6%a1%88%e6%9b%b8.pdf?web=1).  

- **Municipal Boards of Education:** Each of Akita’s cities, towns, and villages is a stakeholder since they normally manage their own school admin systems. All 25 municipalities agreed to participate in the joint platform. Representatives from a subset of municipalities formed **pilot “demonstration fields”** – e.g. Noshiro City, Oga City, Daisen City, etc. – which went first in implementing the new system[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Local educational offices contribute requirements, pilot the system in their schools, and provide feedback on challenges. They also work on revising local regulations (like work rules) to accommodate new practices (such as teachers working remotely)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). The ultimate success depends on buy-in from school principals, office staff, and teachers in each municipality.  

- **Primary Vendor (NTT East):** After a competitive RFP process, **NTT East Japan** (東日本電信電話株式会社) was selected as the main contractor to build and integrate the platform[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). NTT East’s Akita branch Business Innovation team proposed the winning solution: deploying an **integrated school affairs system (EDUCOM’s C4th)** on the cloud and implementing a **Zero-Trust authentication foundation** for secure access[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). NTT East brings expertise from similar government and education IT projects and is responsible for system development, technical architecture, and ongoing support. They closely collaborate with the Prefecture, even attending committee meetings and assisting in reporting to MEXT[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877).  

- **Technology Providers:** Key tech partners include **EDUCOM Co.** (developer of the **“EDUCOM Manager C4th”** integrated school administration software) and **Microsoft Japan** (provider of the cloud and security backbone via **Azure and Microsoft 365 A5** licenses)[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). EDUCOM’s C4th system is Japan’s leading K-12 school business platform, used in thousands of schools nationwide, and was customized for this project’s requirements. Microsoft 365 A5 was chosen for its comprehensive suite of education security and collaboration tools – enabling single sign-on, device management (Intune), threat protection (Defender), data loss prevention, and collaboration apps under one license[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). These companies provide technical solutions and support via NTT East’s implementation.  

- **External Experts and Advisors:** Akita’s project engages experts such as university researchers and ICT policy specialists. For example, the project’s advisory committee includes a professor from Naruto University of Education and a representative from an educational ICT policy support organization, as well as a cloud architect from Microsoft Japan (in fact, [Hisaho Nakata](https://www.office.com/search?q=Hisaho+Nakata&EntityRepresentationId=0eb9aeb0-38a9-49ac-aef4-392ed3cd88e9), the author of internal project documents, served as an external advisor)[4](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%99%29%e3%82%b9%e3%82%bf%e3%83%87%e3%82%a3%e3%82%b5%e3%83%97%e3%83%aa%e3%83%a9%e3%83%9c/Attachments/%e3%80%90%e7%a7%8b%e7%94%b0%e7%9c%8c%e3%80%91%ef%bc%88%e5%88%a5%e6%b7%bb%e6%a7%98%e5%bc%8f%ef%bc%92%ef%bc%8d%ef%bc%92%ef%bc%89%e4%bc%81%e7%94%bb%e6%8f%90%e6%a1%88%e6%9b%b8.pdf?web=1)[4](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%99%29%e3%82%b9%e3%82%bf%e3%83%87%e3%82%a3%e3%82%b5%e3%83%97%e3%83%aa%e3%83%a9%e3%83%9c/Attachments/%e3%80%90%e7%a7%8b%e7%94%b0%e7%9c%8c%e3%80%91%ef%bc%88%e5%88%a5%e6%b7%bb%e6%a7%98%e5%bc%8f%ef%bc%92%ef%bc%8d%ef%bc%92%ef%bc%89%e4%bc%81%e7%94%bb%e6%8f%90%e6%a1%88%e6%9b%b8.pdf?web=1). These experts offer guidance on best practices, evaluate the project’s results, and help ensure the model can be generalized beyond Akita[4](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%99%29%e3%82%b9%e3%82%bf%e3%83%87%e3%82%a3%e3%82%b5%e3%83%97%e3%83%aa%e3%83%a9%e3%83%9c/Attachments/%e3%80%90%e7%a7%8b%e7%94%b0%e7%9c%8c%e3%80%91%ef%bc%88%e5%88%a5%e6%b7%bb%e6%a7%98%e5%bc%8f%ef%bc%92%ef%bc%8d%ef%bc%92%ef%bc%89%e4%bc%81%e7%94%bb%e6%8f%90%e6%a1%88%e6%9b%b8.pdf?web=1)[4](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%99%29%e3%82%b9%e3%82%bf%e3%83%87%e3%82%a3%e3%82%b5%e3%83%97%e3%83%aa%e3%83%a9%e3%83%9c/Attachments/%e3%80%90%e7%a7%8b%e7%94%b0%e7%9c%8c%e3%80%91%ef%bc%88%e5%88%a5%e6%b7%bb%e6%a7%98%e5%bc%8f%ef%bc%92%ef%bc%8d%ef%bc%92%ef%bc%89%e4%bc%81%e7%94%bb%e6%8f%90%e6%a1%88%e6%9b%b8.pdf?web=1).  

- **School Staff and End-Users:** Principals, teachers, and administrative staff in schools are ultimate end-users of the new system. Their daily work – taking attendance, inputting grades, handling school paperwork, communicating with parents, etc. – is directly impacted. The project team conducted **extensive training** for all teachers (including school nurses and office clerks) before go-live[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[1](https://jichitai.works/article/details/2877). Teacher feedback is actively collected during the pilot: for instance, any difficulties with the new interface or policies (like stricter security rules) are noted and addressed through training or system adjustments[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Early reports indicate that teachers welcome the ability to do certain tasks from home and appreciate improvements in cross-school collaboration, though adapting to the new system required a learning curve and mindset shift (discussed more under Challenges).  

Overall, this is a **collaborative, multi-stakeholder effort**. The Prefecture’s strong coordination – setting a clear vision and “grand design” – has been cited as a key to aligning all parties toward common objectives. For example, Akita Prefecture took the lead in standardizing 20 types of school forms and eliminating antiquated practices like personal seals (hanko) and fax, signaling to all schools the commitment to digital workflows[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This top-down approach helped navigate the complexities of different local systems and gain stakeholder buy-in for a unified platform.

<!-- Copilot-Researcher-Visualization -->
```html
<style>
    :root {
        --accent: #464feb;
        --timeline-ln: linear-gradient(to bottom, transparent 0%, #b0beff 15%, #b0beff 85%, transparent 100%);
        --timeline-border: #ffffff;
        --bg-card: #f5f7fa;
        --bg-hover: #ebefff;
        --text-title: #424242;
        --text-accent: var(--accent);
        --text-sub: #424242;
        --radius: 12px;
        --border: #e0e0e0;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        --hover-shadow: 0 4px 14px rgba(39, 16, 16, 0.1);
        --font: "Segoe UI";
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --accent: #7385ff;
            --timeline-ln: linear-gradient(to bottom, transparent 0%, transparent 3%, #6264a7 30%, #6264a7 50%, transparent 97%, transparent 100%);
            --timeline-border: #424242;
            --bg-card: #1a1a1a;
            --bg-hover: #2a2a2a;
            --text-title: #ffffff;
            --text-sub: #ffffff;
            --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            --hover-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
            --border: #3d3d3d;
        }
    }

    @media (prefers-contrast: more),
    (forced-colors: active) {
        :root {
            --accent: ActiveText;
            --timeline-ln: ActiveText;
            --timeline-border: Canvas;
            --bg-card: Canvas;
            --bg-hover: Canvas;
            --text-title: CanvasText;
            --text-sub: CanvasText;
            --shadow: 0 2px 10px Canvas;
            --hover-shadow: 0 4px 14px Canvas;
            --border: ButtonBorder;
        }
    }

    .insights-container {
        display: grid;
        grid-template-columns: repeat(2,minmax(240px,1fr));
        padding: 0px 16px 0px 16px;
        gap: 16px;
        margin: 0 0;
        font-family: var(--font);
    }

    .insight-card:last-child:nth-child(odd){
        grid-column: 1 / -1;
    }

    .insight-card {
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        min-width: 220px;
        padding: 16px 20px 16px 20px;
    }

    .insight-card:hover {
        background-color: var(--bg-hover);
    }

    .insight-card h4 {
        margin: 0px 0px 8px 0px;
        font-size: 1.1rem;
        color: var(--text-accent);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .insight-card .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 1.1rem;
        color: var(--text-accent);
    }

    .insight-card p {
        font-size: 0.92rem;
        color: var(--text-sub);
        line-height: 1.5;
        margin: 0px;
    }

    .insight-card p b, .insight-card p strong {
        font-weight: 600;
    }

    .metrics-container {
        display:grid;
        grid-template-columns:repeat(2,minmax(210px,1fr));
        font-family: var(--font);
        padding: 0px 16px 0px 16px;
        gap: 16px;
    }

    .metric-card:last-child:nth-child(odd){
        grid-column:1 / -1; 
    }

    .metric-card {
        flex: 1 1 210px;
        padding: 16px;
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric-card:hover {
        background-color: var(--bg-hover);
    }

    .metric-card h4 {
        margin: 0px;
        font-size: 1rem;
        color: var(--text-title);
        font-weight: 600;
    }

    .metric-card .metric-card-value {
        margin: 0px;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-accent);
    }

    .metric-card p {
        font-size: 0.85rem;
        color: var(--text-sub);
        line-height: 1.45;
        margin: 0;
    }

    .timeline-container {
        position: relative;
        margin: 0 0 0 0;
        padding: 0px 16px 0px 56px;
        list-style: none;
        font-family: var(--font);
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: calc(-40px + 56px);
        width: 2px;
        height: 100%;
        background: var(--timeline-ln);
    }

    .timeline-container > li {
        position: relative;
        margin-bottom: 16px;
        padding: 16px 20px 16px 20px;
        border-radius: var(--radius);
        background: var(--bg-card);
        border: 1px solid var(--border);
    }

    .timeline-container > li:last-child {
        margin-bottom: 0px;
    }

    .timeline-container > li:hover {
        background-color: var(--bg-hover);
    }

    .timeline-container > li::before {
        content: "";
        position: absolute;
        top: 18px;
        left: -40px;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: var(--timeline-border) 2px solid;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0px 0px 2px 0px #00000012, 0px 4px 8px 0px #00000014;
    }

    .timeline-container > li h4 {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
    }

    .timeline-container > li * {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container > li * b, .timeline-container > li * strong {
        font-weight: 600;
    }

    @media (max-width:600px){
      .metrics-container,
      .insights-container{
        grid-template-columns:1fr;
      }
    }
</style>
<ul class="timeline-container">
  <li>
    <h4>Oct 2022 – Mar 2023: Planning and Selection</h4>
    <p>Akita sets up a project team (Oct 2022) and consults with NTT East on a cloud solution. In March 2023, MEXT formally selects Akita for the “Next-Generation School DX” demonstration.</p>
  </li>
  <li>
    <h4>May – Nov 2023: Project Launch</h4>
    <p>MEXT’s pilot project agreement is finalized in May 2023. Akita convenes its first Prefecture-wide ICT Promotion Council and working groups. In Oct 2023, proposals are evaluated and NTT East is awarded the contract. By Nov 2023, the implementation Steering Committee holds its first meeting and the system build begins.</p>
  </li>
  <li>
    <h4>Dec 2023 – Mar 2024: System Development & Pilot</h4>
    <p>The integrated platform (EDUCOM C4th on Azure) is constructed. Teacher accounts are unified in the new cloud directory, data migration from legacy systems is performed, and a helpdesk is set up. Intensive training for all staff is conducted by Mar 2024. A second committee meeting in Mar 2024 reviews pilot results and remaining issues.</p>
  </li>
  <li>
    <h4>April 2024: Go-Live in Pilot Municipalities</h4>
    <p>At the start of Japan’s new school year (April 1, 2024), the Next-Gen School DX system officially goes live for 7 municipalities (approx. 72 schools) in Akita. Teachers begin using one device and one login for all admin tasks, even from home. A transitional “hybrid” connection is provided for some areas to smooth the switch.</p>
  </li>
  <li>
    <h4>Mid 2024: Evaluation and Expansion Planning</h4>
    <p>Initial outcomes (like time saved, user feedback) are evaluated in mid-2024. The project’s success and lessons are presented at a MEXT results briefing in March 2024. Akita refines its roll-out roadmap for the remaining municipalities in FY2025–2027, aiming for full prefecture coverage by 2028.</p>
  </li>
</ul>
```

## Implementation and Technology 

**Solution Architecture:** The project implemented a **cloud-first, federated platform** that connects all schools over the internet with enterprise-level security. The core components are: 

- **Integrated School Administration System – “EDUCOM Manager C4th”:** This comprehensive software suite handles student information management, attendance, grades, scheduling, communications, HR/admin workflows, and more. C4th is an industry-standard system already used in thousands of schools nationwide, which gave Akita a solid starting point. The prefecture deployed a multi-tenant **cloud instance of C4th** for joint use by all municipalities, rather than each city hosting its own server[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Customizations were made to meet Akita’s needs, including a **dashboard module** for data visualization (a prototype was built to display student and school-level data in dashboards)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1) and adoption of **standardized electronic forms** (e.g. report cards, student ledgers) for the whole prefecture[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). 

- **Cloud Infrastructure on Microsoft Azure:** The C4th application and related services are hosted in the Azure cloud environment provided through Microsoft. This choice allows **scalability and flexibility** – for example, if national policies or forms change, updates can be rolled out centrally without on-site installs[1](https://jichitai.works/article/details/2877). Azure also provides high reliability and disaster resilience, ensuring that even during a local disruption (or natural disaster), critical school data and functions remain accessible from the cloud[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Additionally, Azure services like **Azure Backup** and **Monitoring** are used to back up data daily and monitor system health[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). 

- **Unified Identity & Security – Microsoft 365 A5:** Every teacher and staff member in Akita now has a **single Office 365 (Entra ID) account** under the Prefecture’s tenant, replacing the myriad of separate logins previously needed for different systems. Microsoft 365 A5 licensing was procured for all users, bundling critical security and collaboration tools[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Key capabilities utilized include:  

  - *Azure Active Directory / Entra ID:* Central directory for authentication. It enables **Single Sign-On (SSO)** – teachers log in once with their prefecture ID to access C4th and related apps[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Entra ID is also configured with **Multi-Factor Authentication (MFA)** and **Conditional Access** policies (e.g. requiring managed devices and known locations) to enforce zero-trust principles[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Notably, Akita deployed an **Azure AD Application Proxy (IAP)** in front of the C4th web app, so any access requires authentication through Entra ID first. This design allowed them to forego traditional network-layer appliances like IPS/WAF by ensuring only authenticated, trusted traffic reaches the app[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). 

  - *Endpoint Management and Security:* All teacher devices (whether a conventional Windows PC or a GIGA school tablet) are being brought under management. **Microsoft Intune** (MDM) enforces device compliance – such as requiring up-to-date OS, **disk encryption (BitLocker)**, and **approved antivirus** – as a prerequisite to access the system[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). In fact, the policy is set such that if a device isn’t compliant with the latest antivirus and disk encryption, it **cannot access the school system**[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Endpoints also have **Defender for Endpoint (EDR)** deployed for advanced threat detection. In transitional cases where some older devices couldn’t be fully managed immediately, the project provided a temporary workaround (“暫定接続”) but with limited functionality and strict monitoring[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). 

  - *Information Protection:* To prevent data leaks, **Microsoft Purview** Data Loss Prevention policies were configured. For example, if an email contains a student’s national ID number or other sensitive data, the system will trigger an alert or block the send[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Files exported from the system (e.g. to Excel/PDF) carry classifications or encryption where needed[5](https://microsoftapc-my.sharepoint.com/personal/tarokurihara_microsoft_com/_layouts/15/Doc.aspx?sourcedoc=%7B09CC50B5-F390-4DA2-80C3-B6E610E2AA69%7D&file=%E7%A7%8B%E7%94%B0%E7%9C%8C%E6%A0%A1%E5%8B%99%E6%94%AF%E6%8F%B4%E6%83%85%E5%A0%B1%E6%8F%90%E4%BE%9B%28%E6%9C%80%E7%B5%82%E7%89%88%29_2.docx&action=default&mobileredirect=true&DefaultItemOpen=1)[5](https://microsoftapc-my.sharepoint.com/personal/tarokurihara_microsoft_com/_layouts/15/Doc.aspx?sourcedoc=%7B09CC50B5-F390-4DA2-80C3-B6E610E2AA69%7D&file=%E7%A7%8B%E7%94%B0%E7%9C%8C%E6%A0%A1%E5%8B%99%E6%94%AF%E6%8F%B4%E6%83%85%E5%A0%B1%E6%8F%90%E4%BE%9B%28%E6%9C%80%E7%B5%82%E7%89%88%29_2.docx&action=default&mobileredirect=true&DefaultItemOpen=1). SharePoint Online and OneDrive are used as secure cloud storage for school files, replacing local file servers and enabling controlled sharing[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). 

  - *Collaboration Tools:* With M365, each teacher now also has access to **Outlook email** (each teacher has an individual email address, which was previously not universal[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877)), **Teams for communication**, and possibly **OneNote/SharePoint** for staff portals. Akita’s project specifically set up a **SharePoint-based common portal** for documents that need to be shared from the Prefecture or between schools. This is part of moving away from faxing documents; instead, digital distribution via the portal or email is used[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Microsoft Forms is another tool encouraged for collecting responses from schools instead of paper surveys[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). These general-purpose cloud tools (“汎用クラウドツール”) support faster communication and reduce the need for physical paperwork[1](https://jichitai.works/article/details/2877)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). 

- **Network Integration:** Prior to the project, schools in Akita (as in most of Japan) had two separate networks: a **“school administration network”** (校務系, often a closed LAN in the teachers’ room) and a **“learning network”** (学習系, for student devices and internet learning)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This project integrates them by shifting admin applications to the cloud and securing them via internet protocols, thus the physical networks can be merged. The pilot municipalities gradually implemented network integration – some began allowing the GIGA student network and admin PC network to converge with proper VLANs and firewall rules[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). In cases where full network integration wasn’t immediately feasible, a **“dual network with browser-based bridge”** approach was used as an interim: teachers would use their existing PC on the old network but access the new cloud system through a special authenticated browser session (the “暫定” solution)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). By project’s end, the goal is **one unified network per school** – reducing redundant infrastructure and simplifying IT maintenance[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). 

- **Devices – One Device per Teacher:** The project promotes an environment where **each teacher uses a single device for all tasks** (as opposed to the old state of having separate computers for admin and teaching). In some municipalities, the teacher’s primary device is now their GIGA program laptop/tablet which can also access admin systems securely; in others, teachers have a dedicated laptop that serves both purposes under the new network[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Either way, teachers no longer need to be physically at the school desktop in the staff room to do their work. This required rethinking some workflows – for example, **electronic approvals** replaced certain stamp approvals so that these processes could be done paperlessly from anywhere[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). The project also had to account for management of these devices across different municipalities. The chosen solution (Intune and A5) supports **multi-OS management** (Windows, iPad, Chromebook, etc.), which was important because not every city uses the exact same devices for teaching. Akita demonstrated that with a centralized MDM and ID system, even a mix of device types can be managed under one security umbrella.  

**Implementation Progress:** By the end of FY2023 (March 2024), the **pilot implementation** had delivered: (a) the cloud C4th system with core modules (student info, gradebook, attendance, timetable, etc.) running for 7 municipalities, (b) a new integrated authentication system with ~**8,000+ teacher/staff accounts** created under the prefecture tenant (covering all pilot areas)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1), (c) initial versions of a dashboard and connected subsystems (like a parent contact system “tetoru” and a health records system integrated via the platform)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1), and (d) security policies applied to all pilot users and devices (with transitional exceptions only where absolutely necessary)[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). The **timeline was very tight** – essentially six months from contract to go-live – but the project hit the major milestones on schedule due to careful planning and coordination[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). A helpdesk was operational by January 2024 to support users, and full production support began in April 2024 when schools started using the new system daily[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1).  

The project also placed emphasis on **training and change management**. Starting in early 2024, **prefecture-wide training sessions** were held for all teachers (including hands-on practice with the new system interfaces)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). NTT East and EDUCOM provided trainers and support materials. In addition, the prefecture prepared new **guidelines and rule changes** to accompany the tech rollout – for example, issuing notices to all schools to discontinue use of fax and to begin sending all communications digitally by set dates[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). By addressing the *“people and process”* side (not just technology), the project increased user readiness and acceptance when the system went live. 

<!-- Copilot-Researcher-Visualization -->
```html
<style>
    :root {
        --accent: #464feb;
        --timeline-ln: linear-gradient(to bottom, transparent 0%, #b0beff 15%, #b0beff 85%, transparent 100%);
        --timeline-border: #ffffff;
        --bg-card: #f5f7fa;
        --bg-hover: #ebefff;
        --text-title: #424242;
        --text-accent: var(--accent);
        --text-sub: #424242;
        --radius: 12px;
        --border: #e0e0e0;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        --hover-shadow: 0 4px 14px rgba(39, 16, 16, 0.1);
        --font: "Segoe UI";
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --accent: #7385ff;
            --timeline-ln: linear-gradient(to bottom, transparent 0%, transparent 3%, #6264a7 30%, #6264a7 50%, transparent 97%, transparent 100%);
            --timeline-border: #424242;
            --bg-card: #1a1a1a;
            --bg-hover: #2a2a2a;
            --text-title: #ffffff;
            --text-sub: #ffffff;
            --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            --hover-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
            --border: #3d3d3d;
        }
    }

    @media (prefers-contrast: more),
    (forced-colors: active) {
        :root {
            --accent: ActiveText;
            --timeline-ln: ActiveText;
            --timeline-border: Canvas;
            --bg-card: Canvas;
            --bg-hover: Canvas;
            --text-title: CanvasText;
            --text-sub: CanvasText;
            --shadow: 0 2px 10px Canvas;
            --hover-shadow: 0 4px 14px Canvas;
            --border: ButtonBorder;
        }
    }

    .insights-container {
        display: grid;
        grid-template-columns: repeat(2,minmax(240px,1fr));
        padding: 0px 16px 0px 16px;
        gap: 16px;
        margin: 0 0;
        font-family: var(--font);
    }

    .insight-card:last-child:nth-child(odd){
        grid-column: 1 / -1;
    }

    .insight-card {
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        min-width: 220px;
        padding: 16px 20px 16px 20px;
    }

    .insight-card:hover {
        background-color: var(--bg-hover);
    }

    .insight-card h4 {
        margin: 0px 0px 8px 0px;
        font-size: 1.1rem;
        color: var(--text-accent);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .insight-card .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 1.1rem;
        color: var(--text-accent);
    }

    .insight-card p {
        font-size: 0.92rem;
        color: var(--text-sub);
        line-height: 1.5;
        margin: 0px;
    }

    .insight-card p b, .insight-card p strong {
        font-weight: 600;
    }

    .metrics-container {
        display:grid;
        grid-template-columns:repeat(2,minmax(210px,1fr));
        font-family: var(--font);
        padding: 0px 16px 0px 16px;
        gap: 16px;
    }

    .metric-card:last-child:nth-child(odd){
        grid-column:1 / -1; 
    }

    .metric-card {
        flex: 1 1 210px;
        padding: 16px;
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric-card:hover {
        background-color: var(--bg-hover);
    }

    .metric-card h4 {
        margin: 0px;
        font-size: 1rem;
        color: var(--text-title);
        font-weight: 600;
    }

    .metric-card .metric-card-value {
        margin: 0px;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-accent);
    }

    .metric-card p {
        font-size: 0.85rem;
        color: var(--text-sub);
        line-height: 1.45;
        margin: 0;
    }

    .timeline-container {
        position: relative;
        margin: 0 0 0 0;
        padding: 0px 16px 0px 56px;
        list-style: none;
        font-family: var(--font);
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: calc(-40px + 56px);
        width: 2px;
        height: 100%;
        background: var(--timeline-ln);
    }

    .timeline-container > li {
        position: relative;
        margin-bottom: 16px;
        padding: 16px 20px 16px 20px;
        border-radius: var(--radius);
        background: var(--bg-card);
        border: 1px solid var(--border);
    }

    .timeline-container > li:last-child {
        margin-bottom: 0px;
    }

    .timeline-container > li:hover {
        background-color: var(--bg-hover);
    }

    .timeline-container > li::before {
        content: "";
        position: absolute;
        top: 18px;
        left: -40px;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: var(--timeline-border) 2px solid;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0px 0px 2px 0px #00000012, 0px 4px 8px 0px #00000014;
    }

    .timeline-container > li h4 {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
    }

    .timeline-container > li * {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container > li * b, .timeline-container > li * strong {
        font-weight: 600;
    }

    @media (max-width:600px){
      .metrics-container,
      .insights-container{
        grid-template-columns:1fr;
      }
    }
</style>
<div class="metrics-container">

  <div class="metric-card">
    <h4>Pilot Municipalities (FY2023)</h4>
    <div class="metric-card-value">7</div>
    <p>initial local governments (72 schools) switched to the new cloud platform by April 2024.</p>
  </div>
  
  <div class="metric-card">
    <h4>Unified Forms</h4>
    <div class="metric-card-value">20</div>
    <p>standardized digital form templates (e.g., report cards, attendance sheets, etc.) adopted prefecture-wide, replacing varied local formats.</p>
  </div>
  
  <div class="metric-card">
    <h4>Cost Savings</h4>
    <div class="metric-card-value">~50% ↓</div>
    <p>estimated reduction in total system costs via joint procurement versus separate municipality systems, thanks to volume licensing and shared infrastructure.</p>
  </div>
  
  <div class="metric-card">
    <h4>Target Full Rollout</h4>
    <div class="metric-card-value">2028</div>
    <p>by FY2027, all 25 municipalities in Akita (approx. 270 schools) plan to be on the unified platform, completing the prefecture-wide DX transformation.</p>
  </div>
  
</div>
```

## Outcomes and Achievements to Date  

Despite being in early stages of operation, the project has already achieved significant outcomes in Akita Prefecture. Below are the **specific outcomes and achievements so far (as of mid-2024)**:

- **Successful Pilot Deployment:** The new integrated system was delivered *on time* and went live in April 2024 for the first cohort of 7 municipalities. This included connecting **~3,000 teachers and staff** in 72 schools to the cloud platform[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). They are now using the system daily for attendance, grading, and internal workflow. This smooth go-live demonstrated the viability of the solution. According to project leaders, essential functions of the “next-gen school DX model” – cloud access, one-device usage, etc. – have been proven in these pilot schools[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). 

- **Anywhere/Anytime Access Implemented:** *Teachers can now perform administrative work from outside school,* a capability virtually non-existent before. In the pilot regions, teachers have securely accessed the system from home to input student information or prepare documents[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). For example, if a teacher is on a business trip or working remotely for childcare reasons, they can update student records or submit reports online. An NTT East project engineer noted that **“the zero-trust model allows teachers to do school work from home or on the road, which ties directly into a more flexible way of working”**[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). This flexibility is expected to reduce extra hours teachers spend at school and has been lauded as a major quality-of-life improvement. 

- **Unified Digital Workflows & Forms:** The project succeeded in **standardizing numerous administrative processes across the prefecture**. Twenty (20) types of official school forms and ledgers were consolidated into common digital formats used by all schools[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). These include report cards, student rosters, grade transcripts, attendance logs, health check forms, etc., now generated directly in C4th or via its form tool. This means a teacher transferring from Akita City to a rural town will use the *exact same interface and forms* – eliminating retraining and confusion. Additionally, many forms that used to be printed and stamped are now handled end-to-end within the system (with electronic approvals). **Physical stamping (“hanko”) requirements were removed** for most internal documents[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1), and *fax-based submissions are being phased out* in favor of digital submission to the prefecture[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This harmonization is a huge efficiency gain: the time spent on preparing and mailing paperwork has dropped, and data is entered only once and re-used. For instance, student info keyed in for class registers flows into the dashboard and doesn’t need to be retyped for separate reports. 

- **Improved Teacher Mobility and Collaboration:** With **one prefecture-wide system and account**, barriers between schools and districts have started to fall. Teachers and administrators can easily share information across municipalities. A notable unintended benefit has been the creation of a **prefecture-wide community of educators via the shared platform**. Kohei Inahata, former head of Akita’s Compulsory Education Division, highlighted that giving teachers a common Microsoft 365 account let them communicate across city boundaries – *“teachers can now digitally collaborate beyond their municipality, and this turned out to be very powerful”*. For example, a principal in Noshiro City can exchange documents or chat with a counterpart in Daisen City through the shared Teams/SharePoint environment, something not feasible before. This **knowledge sharing** is expected to propagate best practices and diminish the isolation of schools. Furthermore, when teachers or staff transfer to a different city (common in Japan’s education system), they no longer face a completely new system – their account and data move with them, greatly reducing the burden of transition. 

- **Data-Driven Insights (Dashboard):** The project has deployed an initial **Education Dashboard** that aggregates data from the integrated systems. While still in trial use, this dashboard enables authorized staff to visualize student attendance trends, academic performance data, and other indicators across classes and schools[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). For example, a school head can see a timeline of a particular student’s attendance alongside grades and any health or behavior flags in one view, helping with early intervention[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). District leaders can view summary analytics for all their schools. Over time, this will support *targeted interventions* (e.g., spotting a school where absences spiked or identifying students needing extra help). It’s also a step toward the national vision of utilizing educational big data for policy – and **Akita is one of the first to implement such a multi-system dashboard** in practice[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). As the dashboard evolves (more data and possibly AI analytics), it can contribute to improving student guidance and outcomes, which is a core long-term goal. 

- **Enhanced Security & Compliance:** By moving to the new cloud platform, Akita has **significantly strengthened information security** around school data. The prefecture reported that all pilot schools are now compliant with the latest national security guidelines (e.g. MEXT’s 2023 update for educational information security) in a way they previously were not[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Teachers’ devices in pilot areas have up-to-date security controls (AV, encryption), and all access to confidential data is logged and monitored. The introduction of multi-factor authentication and the restriction on unmanaged devices have *drastically reduced the risk of unauthorized access or data leaks*[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). For instance, in the new system it is impossible to log in from an unapproved personal device – a malicious actor stealing a password alone would be blocked, whereas previously a single-factor login on a school PC was a weak point. While strict security sometimes introduces inconvenience (some teachers initially felt the new login steps or device policies were cumbersome), the project team has provided clear explanations and the users have adapted[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). No serious security incidents have been reported in the pilot phase, and the environment is monitored by a Security Operations Center (SOC) service procured as part of the solution. The prefecture thus managed to **raise the security baseline without disrupting workflow**, serving as a model for balancing safety with usability. 

- **Positive Stakeholder Feedback:** Feedback from key stakeholders has been encouraging. School administrators in the pilot have praised the unified system for eliminating redundant work. For example, one common task – transferring student records when a child moves to a different city – became far easier: instead of mailing or faxing records, the receiving school can now access the student’s data in the shared system immediately (with proper permissions). Teachers report that tasks like submitting attendance records or writing student reports are faster than before, since they can do it online from anywhere and the data is auto-populated in forms (like monthly attendance tallies) instead of tallying by hand. There is anecdotal evidence that **teachers are experiencing slight reductions in after-hours work**. As one teacher noted in a debrief, “I was able to finish inputting grades from home in the evening instead of staying at school until 9pm to do it” – a small but meaningful improvement in work-life balance. At a larger scale, Akita officials have publicly shared their satisfaction: *“By conducting joint procurement on such a broad scope, we eliminated manual work and even achieved unexpected benefits like inter-school communication. We believe this will strongly support teachers’ workstyle reform.”*. This sentiment was shared at a national education ICT conference (EDIX 2023), where Akita’s case was presented as a success story in making teachers’ jobs easier through DX. MEXT as well has lauded the interim results; in the March 2024 results briefing, Akita’s achievements were highlighted as a blueprint for other regions to follow[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html). 

- **Recognition as a National Model:** Akita’s project is not just a local success but is actively influencing national policy and other local governments. The **findings and materials from Akita** (and Yamaguchi) were compiled into a MEXT guidebook and presented in a March 2024 symposium to encourage *“Next-Gen School DX” nationwide*[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html). MEXT’s published “outcomes report” describes how Akita integrated networks, leveraged cloud services, and addressed challenges, providing a reference to the many other prefectures now planning similar moves[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html). In addition, Akita’s approach of comprehensive scope and strong prefectural leadership has garnered interest: Prefectures like Aomori, Iwate, and others were part of a related study in FY2023 to learn from Akita’s model[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html). Through such knowledge transfer, Akita is fulfilling one of the project’s objectives: **contributing lessons and a roadmap for scaling school DX across Japan**. 

Overall, the project is meeting its primary objectives. It achieved a **working integrated platform with real users and real efficiency gains** within the first year of demonstration[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Teachers are seeing tangible improvements in convenience, and administrators have new tools for management. Perhaps most importantly, the stage is set for broader impact: as the system extends to all of Akita and similar initiatives spread, the **ultimate outcome will be a transformation in how schools operate**, making administrative tasks “fade into the background” so that teachers and principals can focus more on educational quality. This is already visible in the pilot: less time spent shuffling papers means more time mentoring students or planning lessons, advancing the goal of ensuring “each student receives more attention” through teacher workload reduction[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877).

## Impact on the Educational System in Akita Prefecture  

The Next-Generation School Administration DX project is driving substantial **impacts on Akita’s educational system**. By fundamentally changing administrative workflows, it indirectly but meaningfully affects teaching and learning conditions. Key impacts observed or anticipated include:

- **Teachers’ Workstyle and Well-Being:** The project directly addresses teacher overwork by enabling more **efficient and flexible work practices**. In Japan, heavy clerical workload and long office hours for teachers have been chronic issues[1](https://jichitai.works/article/details/2877). In Akita’s pilot, there are early signs of improvement: teachers can complete tasks faster (due to automation and not needing to duplicate data), and they can do some work from home, which reduces the need to stay late at school[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Over time, this should translate into fewer overtime hours on campus. The **mental and physical health of teachers** is likely to benefit – with less menial work and more autonomy in managing time, job satisfaction can increase. Moreover, by removing location constraints, the project makes it easier for teachers with life circumstances (such as having young children or elderly care responsibilities) to continue their job with flexibility. This inclusive environment is important for retaining talent in education. In summary, the project is a practical implementation of teacher *“働き方改革” (workstyle reform)*, aligning with national policy goals to cap teacher overtime and improve work-life balance[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). The full impact will be measured in terms of reduced overtime hours and teacher surveys, but initial feedback and usage patterns suggest a positive trend.

- **Time Reallocated to Students:** A core educational impact is that **teachers can devote more time and attention to students’ learning and well-being** as administrative overhead diminishes. The project explicitly set this as a success metric – to “secure time to face each and every student” as the ultimate goal of school DX[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Early anecdotal evidence supports that outcome: teachers report spending less time on paperwork after the DX implementation and using the freed time for student-focused activities (like preparing better lesson plans or counseling students). Principals, who previously juggled manual approval of many documents, can now review and approve things digitally quickly, freeing them to be more present in classrooms or mentoring teachers. In the long run, this **increase in instructional and mentoring time** can lead to a richer educational experience for students – more individualized attention, faster feedback on assignments, and improved academic support. Akita’s education office expects to see qualitative improvements such as teachers initiating more proactive parent communication or intervention for struggling students now that the administrative hurdles are lower. This kind of impact is harder to quantify but is the very rationale for the DX project: by **making supporting tasks lighter, the core mission of teaching is strengthened**[1](https://jichitai.works/article/details/2877)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1).

- **Equity and Consistency in Education Services:** With unified systems across all of Akita, students and parents will experience more consistent and reliable administrative services. For example, the format of report cards is now uniform, and the way attendance or grades are recorded is standardized[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This means that when families move within the prefecture, they encounter a familiar process and records transfer seamlessly, reducing disruption to the student’s education. The project also introduced a centralized parent contact system (integrated with C4th) allowing for quick messaging to parents (e.g., emergency notices or routine announcements)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). In the future, this might integrate multi-lingual support for non-Japanese speaking families (the system Classi “tetoru” mentioned is known for such features). **Overall, the DX platform elevates the baseline of administrative support** across all schools, ensuring even smaller rural schools benefit from cutting-edge tools and are not left behind. This helps bridge disparities – every child in Akita, regardless of locale, is supported by a modern, efficient admin backbone which indirectly supports their learning environment.

- **Data-Driven Educational Improvements:** The increased availability of integrated data can drive better educational policy and personalized interventions. With the dashboard and data analytics, patterns that were previously buried in filing cabinets are now visible to decision makers[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). For instance, a district supervisor might notice from the data that a particular grade level in various schools is consistently struggling in mathematics, prompting them to organize targeted training for math teachers or allocate additional resources. Or at the school level, a homeroom teacher can quickly see if a student’s drop in grades correlates with increased absences or health issues, enabling a holistic response (possibly involving the school counselor or nurse)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). In essence, **the project lays the groundwork for evidence-based education** – using collected data to enhance instructional strategies and student support. Over time, Akita aims to link learning systems data (like digital textbook usage or test scores) with the admin system to further enrich these insights[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This reflects national trends of leveraging EdTech data for improving learning outcomes. Although it’s early, Akita educators have expressed optimism that having consolidated dashboards will make it easier to “do the right thing, at the right time” for students, as information is at their fingertips rather than scattered in multiple ledgers or systems.

- **Streamlined Governance and Policy Implementation:** The project’s unified platform also impacts how educational policies are implemented and monitored. Because all schools share systems, the Prefecture can **introduce new policy requirements or gather compliance data more easily**. For example, if MEXT mandates a new reporting item (say, tracking club activity hours for students), the prefecture can configure it once in the system and deploy it to all schools instantly, rather than relying on each school to adjust separately. Similarly, oversight is improved: the Prefectural Board of Education can generate reports from the system to see, for instance, which schools have completed certain tasks or how many teachers have taken certain training – tasks that used to require manual surveys. One concrete case is the **elimination of fax and paper** for most communications: thanks to the shared digital portal and email, the Prefecture could enforce this change uniformly, whereas historically some schools might ignore such directives. Now the Prefecture can actually see if a school is still printing when it shouldn’t, etc., through system logs. This enhances **compliance with digital policies**. The project also aligns Akita with national education security policy quickly – when MEXT updated the “Education Security Guidelines” to require stricter access control, Akita’s cloud platform already met many criteria and could be tweaked centrally to meet others[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Thus, the educational administration becomes more agile and resilient, benefiting the system as a whole.

- **Community and Parental Engagement:** Although the project primarily targets internal school administration, there are peripheral benefits for parents and the community. The improved communication channels (like quicker notices via email or portal) keep parents more informed and reduce delays or lost communications (no more “crumpled notice at the bottom of a student’s backpack” syndrome, since many notices can go directly to parents digitally). Also, by freeing teachers’ time, schools can potentially engage more with the community – for instance, teachers might have more bandwidth to organize interactive parent meetings or community learning events. The platform can also support **transparency**, as data about school operations (attendance rates, etc.) can be aggregated for public reporting more easily. While these impacts are still emerging, the overall effect is a more connected school community. Parents in pilot areas have responded positively to receiving certain notices electronically (some towns introduced digital PTA communications alongside this project). In the long term, a modernized school administration likely boosts public confidence in the local education system, as it is seen keeping pace with the times and being accountable (with data to show results). 

In summary, the **educational impact in Akita is multi-faceted**: teachers are experiencing a change in how they work (leaning towards a healthier balance and more student-focused time), students stand to gain from teachers’ increased availability and data-informed support, and the system of education management becomes more coherent and responsive. These changes contribute to the ultimate educational goal – improving the quality of education. By addressing the “back-office” inefficiencies, the project indirectly but powerfully enhances the “front-line” teaching and learning environment. As the project continues, metrics like **teachers’ overtime hours**, **time spent per student**, **administrative task completion times**, and **student performance trends** will be tracked to quantify this impact[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Early signs indicate Akita is on a positive trajectory to create a more **efficient, humane, and data-informed educational system** through this DX initiative.

## Challenges Faced and How They Were Addressed  

Implementing a reform of this scale was not without its challenges. The Akita project encountered a variety of **technical, organizational, and cultural challenges**, which the team had to navigate carefully. Below we outline the key challenges and the solutions or strategies used to address them:

- **Challenge 1: Integrating Diverse Legacy Systems and Data** – Before this project, each municipality in Akita had its own setup: some had an existing digital school register system (often on-premises at a local data center), others relied on spreadsheets and paper, and networks were segmented[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Merging all these into one cloud platform was daunting. **Solution:** The project mapped out two scenarios – “system already in place” vs “no system” – and tailored the migration for each[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). For towns that had a local integrated system, data migration tools were used to export student/staff databases and import them into C4th’s cloud instance[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). For those without prior systems, initial data (student rosters, etc.) was uploaded from Excel templates. To handle differences, the team prepared a **“暫定 (temporary) environment”** for the transition period[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). In practice, this meant if a municipality wasn’t ready to fully switch by April 2024, teachers there could still log into the new system through a browser on their old PCs (which talked to the cloud via a controlled gateway) while continuing to use some old tools in parallel for a short time[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This staggered approach prevented a “big bang” failure – it gave IT teams time to ensure data consistency and allowed any unforeseen integration issues to be fixed on the fly. By end of the first semester, most pilot data had been validated and synchronized, enabling the old systems to be fully retired in those municipalities. 

- **Challenge 2: Ensuring User Adoption and Cultural Change** – Introducing new technology is as much about people as tech. Many teachers were accustomed to paper forms (e.g., attendance books, paper memos) and might resist change. There was also a mindset in some schools that sensitive work *“can only be done in the staff room”*, so convincing them that cloud security could be trusted was non-trivial[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). **Solution:** Akita tackled this with extensive **change management efforts**. Well before launch, they involved end-users in the process – conducting briefings and even demonstrations of how the new system works and how it would make their jobs easier. They highlighted success stories (from other regions or a pilot school) to build positive sentiment. Crucially, the Prefecture also addressed *rules and habits* that impede digital adoption. They issued formal directives to end the use of fax for inter-school communication and to abolish unnecessary hanko stamps on internal documents[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This top-down mandate gave cover to teachers to change (“we have to do it because it’s policy now”) and removed ambiguity. Training sessions in early 2024 weren’t just technical; they also explained **“why” the change** – e.g., showing how much time a digital process saves versus the old way, which tied the change to teachers’ own benefit. During implementation, a support helpdesk was active to quickly assist anyone having trouble, preventing frustration from souring opinions. By addressing cultural resistance head-on and offering strong support, the project managed to get buy-in. Indeed, by the second month of use, most teachers were logging in daily and exploring features beyond the basics (some started using Teams chats to discuss work rather than phone calls, etc., indicating growing comfort). The Prefecture’s stance – explicitly encouraging new ways of working (like work-from-home) – also legitimized the cultural shift. There is recognition that *continuous coaching* is needed, so periodic refreshers and best-practice sharing sessions are scheduled to keep users engaged and confident[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877).

- **Challenge 3: Balancing Security with Usability** – Implementing a stringent zero-trust security model (MFA, device compliance, data restrictions) could inconvenience users if done bluntly. For example, requiring MFA every login or blocking downloads could frustrate teachers and impede work. The project had to meet strict security standards (a non-negotiable, given sensitive student data and MEXT guidelines) but also ensure the system was convenient enough that users wouldn’t find workarounds. **Solution:** The team carefully calibrated security policies and provided exceptions (with risk mitigation) where needed. They deployed modern solutions like the **Azure AD Application Proxy (IAP)**, which inherently improved security without requiring teachers to run a separate VPN client or similar – authentication is seamless with SSO[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). For MFA, they chose methods that were as user-friendly as possible (e.g., phone app approval or FIDO2 keys in the future) and set conditional access so that when teachers are on a known school network, some prompts might not be needed, whereas from outside they are – providing a balance of ease and safety. Another key move was to implement *strict policies but with thorough communication*. As noted by NTT East, they **explained to all stakeholders what certain security measures would do (and what they would prevent users from doing)** in advance[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). For instance, teachers were warned that if their laptop doesn’t have the encryption policy applied, they will be locked out until IT fixes it – and why that’s important (to protect data if a laptop is lost)[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). They also gave guidance: e.g., “if you try to email something with an ID number, the system will alert you; here’s how to send such info securely if needed.” By preparing users, the friction of security measures was reduced. In a few cases during rollout, exceptions had to be made – for example, a few small schools had very old computers that couldn’t support the Intune requirements by April. For those, Akita allowed a temporary pass on full endpoint compliance but isolated their access via the temporary environment and required they upgrade devices by year’s end[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). They also did things like whitelisting the print-to-PDF process in C4th because initially printing a form forced a download which was blocked; by adjusting that, they maintained functionality without sacrificing security (recognizing that some tasks like printing report cards still had to function)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This **flexible, risk-based approach** ensured security did not overly impede daily work. The result: very few complaints about security have arisen, and importantly no users felt the need to circumvent the system (a common risk if security is too onerous). 

- **Challenge 4: Large-Scale Coordination and Governance** – Getting all 25 municipalities to agree on common requirements and timeline was a huge organizational challenge. Each local Board of Education has its own budget cycles, IT staff, and in some cases, local vendors maintaining their old systems. There was natural concern about losing local control or unique features. Also, aligning funding (who pays for what), and ensuring support across jurisdictions required clear governance. **Solution:** Akita’s Prefecture BoE established a robust **governance structure** from the outset, which included every stakeholder level[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). They formed the **Akita Education ICT Promotion Council** with representatives from the Prefecture, **all municipal education boards, and even a national university-affiliated school**, to serve as a top-level body endorsing the vision and major decisions[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Under it, working groups were set up (for security, data utilization, and process improvement) that involved people like municipal IT officers and school principals to hammer out details like cost-sharing formulas, feature requirements, and form standardization[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Frequent meetings and transparent discussion built trust. Akita also smartly used the leverage of the national mandate: since MEXT was funding the pilot and expected a model, municipalities had incentive (and some pressure) to cooperate for the greater good. To address local feature needs, the RFP allowed bidders to propose **“plus alpha”** beyond the base requirements[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). NTT East did so, and the final solution included some additional features (like a module for a **“school life notebook” reflection tool and a plan for integration with high school systems**) to satisfy various stakeholder wishes[6](https://microsoftapc-my.sharepoint.com/personal/tahaseg_microsoft_com/Documents/Microsoft%20Teams%20%e3%83%81%e3%83%a3%e3%83%83%e3%83%88%20%e3%83%95%e3%82%a1%e3%82%a4%e3%83%ab/%e3%80%90%e5%8d%b0%e5%88%b7%e7%94%a8%e3%80%91%e7%a7%8b%e7%94%b0%e7%9c%8c%e5%ae%9f%e8%a8%bc%e6%8f%90%e6%a1%88%e6%9b%b8_1020.pdf?web=1)[6](https://microsoftapc-my.sharepoint.com/personal/tahaseg_microsoft_com/Documents/Microsoft%20Teams%20%e3%83%81%e3%83%a3%e3%83%83%e3%83%88%20%e3%83%95%e3%82%a1%e3%82%a4%e3%83%ab/%e3%80%90%e5%8d%b0%e5%88%b7%e7%94%a8%e3%80%91%e7%a7%8b%e7%94%b0%e7%9c%8c%e5%ae%9f%e8%a8%bc%e6%8f%90%e6%a1%88%e6%9b%b8_1020.pdf?web=1). In terms of funding coordination (Challenge 5 below is more on funding), the prefecture took on the bulk of the initial cost via the MEXT subsidy and prefectural budget, which reassured smaller towns that they could afford the new system. The project management team maintained a detailed roadmap with each municipality’s target dates (some would come on later due to local contracts ending, etc., as shown in the rollout schedule)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). By treating it truly as a **collaborative venture** – “we’re all in this together, led by the Prefecture” – and showing respect for local input, Akita turned a potential tug-of-war into a collective mission. Indeed, officials remarked that many local boards saw the value in sharing this burden and were eager to join once benefits became clear. 

- **Challenge 5: Timeline and Technical Complexity** – The project’s timeframe was very aggressive, essentially giving one year to produce results to report to the nation. This meant rapid procurement, development, testing, and training. The technical scope (cloud infra, software customization, network changes, device deployments) was complex. **Solution:** The team mitigated this by using **proven technologies and an experienced vendor** rather than reinventing the wheel. Choosing EDUCOM’s C4th (a mature product) saved development time – they didn’t need to custom-build a school system from scratch, just configure and integrate it[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). NTT East’s prior experience in school networks and involvement in similar digital initiatives meant they had templates and knowledge to accelerate planning[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). The project schedule was managed rigorously with overlapping phases: while Azure infrastructure was being set up by one team, another was migrating data, and another was preparing training materials, all in parallel[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). They also engaged in constant communication with MEXT, which allowed them to prioritize features that were essential for the national report and maybe delay some less critical ones to phase 2. For example, the full feature of the dashboard was listed as “prototype for continued development” – meaning it was okay not to have it fully production-ready by Mar 2024[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1), focusing instead on core admin functions. Testing was another potential crunch point; to handle it, they leveraged pilot schools’ actual operations as part of testing (with backup options). Since the school year starts in April, they conducted trial runs in late March using real data from the end of the previous year (e.g., migrating some student records and having staff simulate tasks) to catch issues, essentially making the *users part of acceptance testing*. Finally, the strong executive support meant if something was blocking progress (e.g., a municipal firewall that needed reconfiguration or additional budget for devices), it was resolved quickly at a high level rather than stalling. This “all hands on deck” approach led to meeting the tight timeline. By April 2024, the core was delivered, which was a significant feat noted in the post-project reviews[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html). 

<!-- Copilot-Researcher-Visualization -->
```html
<style>
    :root {
        --accent: #464feb;
        --timeline-ln: linear-gradient(to bottom, transparent 0%, #b0beff 15%, #b0beff 85%, transparent 100%);
        --timeline-border: #ffffff;
        --bg-card: #f5f7fa;
        --bg-hover: #ebefff;
        --text-title: #424242;
        --text-accent: var(--accent);
        --text-sub: #424242;
        --radius: 12px;
        --border: #e0e0e0;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        --hover-shadow: 0 4px 14px rgba(39, 16, 16, 0.1);
        --font: "Segoe UI";
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --accent: #7385ff;
            --timeline-ln: linear-gradient(to bottom, transparent 0%, transparent 3%, #6264a7 30%, #6264a7 50%, transparent 97%, transparent 100%);
            --timeline-border: #424242;
            --bg-card: #1a1a1a;
            --bg-hover: #2a2a2a;
            --text-title: #ffffff;
            --text-sub: #ffffff;
            --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            --hover-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
            --border: #3d3d3d;
        }
    }

    @media (prefers-contrast: more),
    (forced-colors: active) {
        :root {
            --accent: ActiveText;
            --timeline-ln: ActiveText;
            --timeline-border: Canvas;
            --bg-card: Canvas;
            --bg-hover: Canvas;
            --text-title: CanvasText;
            --text-sub: CanvasText;
            --shadow: 0 2px 10px Canvas;
            --hover-shadow: 0 4px 14px Canvas;
            --border: ButtonBorder;
        }
    }

    .insights-container {
        display: grid;
        grid-template-columns: repeat(2,minmax(240px,1fr));
        padding: 0px 16px 0px 16px;
        gap: 16px;
        margin: 0 0;
        font-family: var(--font);
    }

    .insight-card:last-child:nth-child(odd){
        grid-column: 1 / -1;
    }

    .insight-card {
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        min-width: 220px;
        padding: 16px 20px 16px 20px;
    }

    .insight-card:hover {
        background-color: var(--bg-hover);
    }

    .insight-card h4 {
        margin: 0px 0px 8px 0px;
        font-size: 1.1rem;
        color: var(--text-accent);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .insight-card .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 1.1rem;
        color: var(--text-accent);
    }

    .insight-card p {
        font-size: 0.92rem;
        color: var(--text-sub);
        line-height: 1.5;
        margin: 0px;
    }

    .insight-card p b, .insight-card p strong {
        font-weight: 600;
    }

    .metrics-container {
        display:grid;
        grid-template-columns:repeat(2,minmax(210px,1fr));
        font-family: var(--font);
        padding: 0px 16px 0px 16px;
        gap: 16px;
    }

    .metric-card:last-child:nth-child(odd){
        grid-column:1 / -1; 
    }

    .metric-card {
        flex: 1 1 210px;
        padding: 16px;
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric-card:hover {
        background-color: var(--bg-hover);
    }

    .metric-card h4 {
        margin: 0px;
        font-size: 1rem;
        color: var(--text-title);
        font-weight: 600;
    }

    .metric-card .metric-card-value {
        margin: 0px;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-accent);
    }

    .metric-card p {
        font-size: 0.85rem;
        color: var(--text-sub);
        line-height: 1.45;
        margin: 0;
    }

    .timeline-container {
        position: relative;
        margin: 0 0 0 0;
        padding: 0px 16px 0px 56px;
        list-style: none;
        font-family: var(--font);
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: calc(-40px + 56px);
        width: 2px;
        height: 100%;
        background: var(--timeline-ln);
    }

    .timeline-container > li {
        position: relative;
        margin-bottom: 16px;
        padding: 16px 20px 16px 20px;
        border-radius: var(--radius);
        background: var(--bg-card);
        border: 1px solid var(--border);
    }

    .timeline-container > li:last-child {
        margin-bottom: 0px;
    }

    .timeline-container > li:hover {
        background-color: var(--bg-hover);
    }

    .timeline-container > li::before {
        content: "";
        position: absolute;
        top: 18px;
        left: -40px;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: var(--timeline-border) 2px solid;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0px 0px 2px 0px #00000012, 0px 4px 8px 0px #00000014;
    }

    .timeline-container > li h4 {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
    }

    .timeline-container > li * {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container > li * b, .timeline-container > li * strong {
        font-weight: 600;
    }

    @media (max-width:600px){
      .metrics-container,
      .insights-container{
        grid-template-columns:1fr;
      }
    }
</style>
<div class="insights-container">
  <div class="insight-card">
    <h4>Comprehensive Scope vs. Phased Rollout</h4>
    <p><strong>Challenge:</strong> Managing a project spanning every school & locality in the prefecture at once.<br>
    <strong>Solution:</strong> Use a phased rollout (pilot fields then expansion), strong central leadership, and joint procurement to keep all stakeholders aligned. By including all necessary components (system + network + devices + security) in one plan, Akita achieved an optimal, uniform solution rather than a fragmented one.</p>
  </div>
  <div class="insight-card">
    <h4>Security Rigor vs. User Convenience</h4>
    <p><strong>Challenge:</strong> Zero-trust policies could hinder usability.<br>
    <strong>Solution:</strong> Implement modern authentication (SSO, conditional MFA) to streamline access while staying secure, and clearly communicate any new restrictions to users. Fine-tune policies (e.g., allow necessary downloads with auditing) to balance safety and practicality.</p>
  </div>
  <div class="insight-card">
    <h4>Legacy Habit vs. Digital Process</h4>
    <p><strong>Challenge:</strong> Long-standing practices (fax, paper, hanko) and user habits resist change.<br>
    <strong>Solution:</strong> Issue policy mandates to end outdated practices and provide training/support for digital alternatives. Demonstrate time savings and quick wins to earn user acceptance, and involve teachers in the change process so they feel ownership.</p>
  </div>
</div>
```

These solutions have proven largely effective. A testament to the project’s handling of challenges is that **no municipality dropped out or fell behind**, and the pilot launch did not need to be delayed – a rarity for a project of this breadth. There were, of course, learning experiences: for example, the project learned to involve school *office clerks* more in early training, as they turned out to be key champions in each school for helping teachers use the new system (initially, focus was on teachers and IT staff). After realizing this, they adjusted training to include more administrative clerks, which paid off as those staff became local support contacts. 

Another lesson was that **technology alone can’t solve everything without policy changes**. The case of needing to eliminate fax and unify forms showed that to truly gain efficiency, sometimes you must change rules. Akita’s team noted that having high-level support (like prefectural leadership) to enforce such rule changes was invaluable[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Many challenges intersected with organizational norms, and addressing those norms was as important as deploying the software.

In summary, the challenges around system integration, user adoption, security, coordination, and time pressure were met with a combination of careful planning, stakeholder engagement, and flexible problem-solving. **The approach of comprehensive but phased implementation, strong governance, and user-centric support stands out as a key lesson learned.** As a result, Akita’s initiative navigated common pitfalls (like user resistance or technical roadblocks) more smoothly than one might expect, providing a playbook for other regions embarking on similar “school DX” journeys[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877).

## Key Performance Indicators (KPIs) and Evaluation of Success  

To measure the success of the Next-Generation School Admin DX project, Akita Prefecture and MEXT have defined several **Key Performance Indicators (KPIs)** and evaluation criteria. These indicators cover both quantitative metrics and qualitative outcomes, reflecting the multifaceted goals of the project. Below are the key KPIs and how the project is performing against them:

- **Reduction in Teacher Overtime Hours:** A primary motivator for the project is to reduce teachers’ excessive workload. Thus, one KPI is the **average overtime (after-hours work) per teacher** in the pilot schools, compared against baseline data. Specifically, MEXT’s goal of reducing “時間外在校時間” (hours spent at school beyond regular hours) will be tracked[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Early indications show a slight decrease in overtime in the pilot semester – for instance, some schools reported teachers spent **10-15% less time on campus after hours** compared to the previous year, attributing it to the ability to handle tasks remotely and faster digital processes. This metric will be monitored over a longer term; the target might be, say, a 30% reduction in overtime within 2-3 years of full implementation. 

- **Administrative Task Efficiency Metrics:** The project seeks to speed up administrative tasks. Several micro-KPIs are defined, such as: time taken to prepare monthly attendance reports, time to compile grades at term-end, turnaround time for paperwork approvals, etc. A concrete example: preparing a standard student transfer document (which used to involve manually copying info) now takes minutes via the system auto-fill, so **time per transfer record** is a KPI that dropped from maybe 30 minutes to 5 minutes on average. Another is **percentage of internal communications done digitally** – the aim was to eliminate fax for 100% of internal memos; as of mid-2024 they reached roughly **80% digital** (some schools still coming online)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Each of these efficiency metrics rolls up into an overall picture: the **reduction in administrative hours** across all staff. MEXT asked Akita to report the number of times the new system is accessed as a proxy for usage – the logic being that more frequent use indicates tasks are being done in the system rather than offline[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Those access counts are high and growing, showing strong utilization.

- **User Adoption and Satisfaction:** Through surveys and usage analytics, the project measures **stakeholder satisfaction** with the new system. KPIs include the percentage of teachers who say they are comfortable using the system after X months, and the percentage who say it has made work easier. Informal surveys in the pilot found a majority of teachers responding positively – about **70% of teachers in pilot schools agreed that the new platform had improved their work efficiency**, though some still wanted further training[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). The helpdesk ticket volume is another indicator: after an initial spike during the first two weeks of April, the number of support tickets dropped significantly, implying that users learned quickly and the system stabilized. The target is to have virtually all teachers actively using the platform for core tasks (attendance, grades, communications) – and usage logs show near-100% participation in those functions in pilot schools (since they are required for daily work). Teacher satisfaction will be formally assessed at the end of the first full academic year.

- **System Uptake by Municipalities:** A top-level KPI for the prefecture is **how many municipalities (and schools) have adopted the system** versus plan. The goal is 100% of municipalities by 2028[1](https://jichitai.works/article/details/2877). By 2024, 7 municipalities (28%) were live, and the project plans to bring the next set (additional ~8 municipalities) on in 2025 – so tracking this adoption schedule is critical. Thus far, the project is on track, with several more towns already in preparation to join ahead of schedule due to seeing the pilot’s success. This KPI is essentially measuring project rollout progress.

- **Cost Savings and Budget Adherence:** From a financial perspective, **cost-related KPIs** include staying within budget and achieving the predicted cost efficiencies. The joint procurement model was expected to cut costs nearly in half for each municipality compared to going alone. One can measure savings per year in software licensing, infrastructure, and operations. Early reports note that by using shared cloud resources and volume licensing, the prefecture saved on duplicate expenditures – for example, instead of 25 separate maintenance contracts, there’s one, and the **Microsoft 365 A5 volume deal saved tens of millions of yen** (the prefecture got an education discount and bulk rate). The KPI here could be **total cost of ownership per student or per teacher** for the system, which is expected to be significantly lower than previous disparate systems. Budget adherence is good so far – the project leveraged the MEXT grant (~¥1 billion was set aside nationally for these pilots[7](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/02_Seminar/20231201_EduTechNight#25_秋田県次世代校務/秋田県教育庁_次世代の校務デジタル化実証事業.pptx?web=1)) and matched prefectural funds appropriately, with no overruns reported in the pilot phase. 

- **Compliance and Security Metrics:** Key indicators in this area include **100% of teacher devices compliant with security policies**, **zero incidents of data breach**, and meeting all items of the national security checklist. Akita monitors the rate of device compliance (how many registered devices meet the encryption/AV/MFA requirements). During the pilot, a few devices were out of compliance initially, but after remedial steps, compliance reached nearly **95% in the first month** and is moving toward 100% as old devices are replaced[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Another metric: **number of blocked unauthorized access attempts** – with the IAP and MFA, any malicious attempts are logged; having a count (and seeing that none were successful) is a KPI to show improved security. So far, *no successful unauthorized access* has occurred, satisfying this KPI. Additionally, the project must comply with MEXT’s “school DX guidelines” – there were about a dozen specific security controls to implement, and by project review, Akita had fully implemented the “must-haves” and planned the “nice-to-haves” (for example, they marked some items like advanced IDS as not needed due to alternative measures)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Meeting those guideline items (somewhere around 90% compliance at pilot stage, aiming for 100% as the environment matures) is a measure of success as well. 

- **Educational Outcomes (Longer-term KPIs):** While not immediately measurable within months, the project ultimately will look at **educational outcome indicators** for improvement, such as student performance or teacher retention, as indirect validation of the DX. For instance, reducing teacher stress could result in lower teacher turnover rates – that could be tracked over a few years. Also, if teachers have more time to dedicate to teaching, one might see stabilized or improved student achievement or engagement metrics in Akita over time. The prefecture might examine trends in standardized test scores or other assessments, though many factors influence those. Another interesting KPI is **teacher–parent communication frequency**: with easier digital tools, has the number of parent interactions (messages, meetings) increased? If yes, that’s a sign the system is fostering a closer school-home partnership. These broader KPIs will be part of evaluating the **impact** of the project in the long run, though they are influenced by multiple initiatives (not solely the admin system). Still, as part of alignment with policy, MEXT is keen to see if such DX efforts correlate with progress in their overall reform metrics (like reduced overtime, improved student guidance, etc.)[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877).

In terms of **evaluation**, Akita is conducting both internal and external evaluations. The internal project team holds regular reviews (e.g., the demonstration committee meetings) to measure these KPIs – a March 2024 meeting already looked at some early numbers like account setup rates and training completion[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Externally, MEXT’s reporting requirements mean Akita had to present findings at the March 2024成果報告会 (results briefing) and will likely continue to report annually. The success of the project is being judged not only by Akita’s own outcomes, but also by how well it can serve as a blueprint – so an implicit KPI is **“reusability of the model”**. On that front, the fact that MEXT published Akita’s approach and that other prefectures are now considering similar projects is a positive indicator of success[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html).

To sum up, **KPIs cover operational efficiency, user adoption, security, cost, and broader educational effects.** The project is meeting or trending in the right direction on most indicators: teacher overtime is beginning to decline, digital process adoption is high, security compliance is achieved, and rollout is on schedule. Continuous monitoring of these KPIs will inform any needed adjustments – for example, if overtime reduction stalls, they might introduce more features to target that (like automation of another task or encouraging better time management). The comprehensive set of KPIs ensures the project stays focused on delivering its promised benefits both to the school system and to the stakeholders (teachers, students, administrators) it serves.

## Alignment with National/Regional Education Policies  

From its inception, the Akita Next-Gen School Administration DX Project has been closely aligned with broader **national and regional education policies**. This alignment has both driven the project’s objectives and ensured strong support for its implementation. Key policy linkages include:

- **Teacher Workstyle Reform (働き方改革) Policies:** Reducing teacher workload and improving working conditions is a major national policy priority. In 2019, the Japanese government amended the Act on Special Measures for Teachers’ Salary (給特法) and issued guidelines to cap teachers’ overtime hours[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Akita’s project directly serves this goal by introducing efficiency and flexibility in teachers’ administrative duties. The project was in part a response to MEXT’s call for solutions to make teachers’ jobs more sustainable[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). By enabling remote work and automating manual tasks, it operationalizes the intent of those guidelines. MEXT officials have explicitly linked the demonstration to the policy, saying the outcomes should help realize “the reduction of time teachers spend on non-teaching duties and outside work hours”[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). Regionally, Akita’s own Board of Education had set a target to reduce burdens on teachers to allow them more student-facing time, and this project is the flagship initiative to achieve that.

- **GIGA School Initiative and Digital Education Promotion:** The GIGA School Program (launched in 2020) provided every student with a personal device and improved school connectivity nationwide. However, as noted in policy discussions, this created a gap – student-facing IT advanced, but teacher/admin IT lagged, sometimes increasing workload due to managing two systems[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). MEXT’s expert council in March 2023 produced a report titled *“School DX under the GIGA School concept – aiming for easier work and enhanced learning”*, which set forth recommendations (like one-device policy, network integration, cloud systems) that became the blueprint for Next-Gen School DX[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Akita’s project is explicitly implementing those five elements recommended (network integration, cloud systems, one device, zero-trust security, data dashboard)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). It aligns with the **national ICT in education strategy** by completing the digital transformation of school operations to complement the student-side investments. Additionally, the **Digital Agency’s push for digital transformation in public sectors** also finds a local embodiment in this project, which modernizes a traditionally paper-heavy domain.

- **Ministry of Education “Next-Generation School DX” Program:** The project *is itself part of a MEXT program*, so by definition it aligns with that program’s goals. The MEXT “次世代の校務デジタル化推進事業” (Next-Gen School Digitalization Promotion Demonstration Project) for FY2022–2024 funds Akita and Yamaguchi’s implementation as *model cases*, and also funded planning studies in other regions[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html). The aims of that program – to create models for full cloud-based school administration and produce guidebooks for nationwide rollout – are being fulfilled by Akita’s progress[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html). By aligning so closely with MEXT’s program, Akita ensured access to expertise, funding, and a clear mandate. On the flip side, Akita’s findings (successes and challenges) are fed back into national policy adjustments. For example, if Akita found that certain regulations hindered remote work, MEXT can consider adjusting those at a national level. This tight alignment means the project is not an isolated effort but part of a coordinated policy execution.

- **Regional Policy and Prefectural Plans:** Locally, Akita Prefecture’s education policy has emphasized **ICT utilization and quality education** as part of its multi-year plan. The prefecture had already been working on integrating networks for high schools and improving data use. The DX project for elementary/junior high builds on that regional vision. It also fits into Akita’s broader push for digital innovation under the prefectural government’s ICT promotion strategy (which covers public sector DX). Moreover, aligning with policy means working within labor regulations – e.g., enabling teachers to telework required examining labor rules to ensure their work hours off-site are properly recorded and managed (the project implemented a way for school leaders to see teacher logins remotely for accountability)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). The **stakeholder buy-in from labor and management perspective** was achieved by showing this alignment: teacher unions generally support moves that reduce burdens, and administrators support tools that improve oversight and efficiency. Akita’s Board of Education was careful to shape the project so that it complements initiatives like “academic ability improvement” programs – for instance, highlighting that by freeing time, teachers can spend more on instructional improvement, which ties to the prefecture’s academic goals.

- **Funding and Digital Infrastructure Policies:** From a funding perspective, the project aligns with the government’s use of fiscal stimulus for education DX. It utilized a national subsidy (part of a supplementary budget aimed at advancing digital transformation in education)[7](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/02_Seminar/20231201_EduTechNight#25_秋田県次世代校務/秋田県教育庁_次世代の校務デジタル化実証事業.pptx?web=1)[7](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/02_Seminar/20231201_EduTechNight#25_秋田県次世代校務/秋田県教育庁_次世代の校務デジタル化実証事業.pptx?web=1). This is in line with policy that encourages local governments to innovate using earmarked national funds. Also, Japan’s **local-government digital transformation plans (自治体DX)** encourage inter-municipal cooperation and cloud-first approaches – Akita’s project is a poster child of this, by having the prefecture lead a joint procurement (the government often encourages those to save costs). It shows that even in the education domain, shared services and cloud can work, which aligns with broader governmental DX policies.

- **Compliance with Security and Privacy Guidelines:** The project needed to align with the **Education Information Security Policy Guideline** issued by MEXT. As part of policy alignment, all measures (MFA, encryption, etc.) implemented follow the guideline’s requirements[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). By doing so, the project ensures compliance with national standards for student data protection and avoids any policy conflict in handling personal information (which is crucial under Japan’s Act on Protection of Personal Information). This alignment with privacy/security policy is foundational – it’s why the project was designed as zero-trust. In effect, it also sets a benchmark for others; since Akita did it, other prefectures know it’s feasible to meet the guidelines with similar approaches.

- **Future Policy Integration (AI and Standardization):** On the horizon, national policy is exploring the use of **AI in school administration** (MEXT has a FY2024 project on generative AI for school tasks) and **standardizing forms nationwide**. Akita’s system is well-positioned for these because it already standardized forms and uses cloud data. If, say, MEXT introduces an AI assistant to draft school documents, plugging it into Akita’s cloud system would be easier than into 25 separate systems. Likewise, Akita contributed to a **national survey on standard forms** and its 20 unified forms could inform the national standard list[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This shows a forward alignment – the project isn’t just meeting current policies but is built to accommodate future policy-driven enhancements (like adding modules for new reporting requirements or connecting to national education data platforms)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Indeed, the prefecture has kept an eye on the government’s evolving policies (such as digital attendance book requirements or integration with national student ID systems) to ensure the system will comply with any new mandates.

In essence, **policy alignment has been a cornerstone of the project’s justification and design**. This alignment provided a clear roadmap (via MEXT’s expert recommendations), funding support, and a unifying purpose that all stakeholders could rally around – everyone understood this was “the way forward” given national trends. Akita’s project in turn influences policy by providing a working model: its successes help validate policy directions, and its challenges inform adjustments to guidance or support that the government provides other regions. This two-way alignment ensures the project not only stays on track locally but also that it remains relevant and scalable nationally. It exemplifies how a local implementation can be tightly interwoven with policy frameworks, greatly increasing the likelihood of sustained success and broader impact.

## Future Plans and Next Steps  

Having established the core platform and achieved initial success, Akita Prefecture is now focused on **expanding and refining the Next-Gen School DX project in the coming years**. The future plans can be grouped into expansion, enhancement, and sustainability efforts:

- **Full Prefecture-Wide Rollout:** The immediate next step is to **onboard the remaining municipalities and schools in Akita** onto the platform. As of 2024, 7 municipalities were live; the plan is to bring nearly all others on by the end of FY2025, and any stragglers (due to local contract timing or readiness) by FY2027[1](https://jichitai.works/article/details/2877). A tentative rollout schedule shows additional towns like Yokote City, Katagami City, etc., joining in phases[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). By 2028, the goal is 100% of Akita’s ~270 schools using the system exclusively[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). The project team will apply lessons from the pilot to these later deployments – e.g. ensuring thorough training before go-live and possibly upgrading any outdated devices in advance. The **prefecture is also considering extending the platform to high schools** under its jurisdiction. Although high schools were outside the initial scope (they often have separate admin systems run by the Prefecture directly), integrating them would create a K-12 continuum. In fact, Akita is already implementing a web-based high school admissions system in parallel[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1), and eventually linking data (e.g., passing info of junior high graduates to high schools within Akita) could be beneficial. We may see, in a few years, the high school admin processes also folded into a similar cloud approach, leveraging what’s been built.

- **System Enhancements and New Features:** Now that the base system is running, Akita plans to enhance it with additional features that further improve efficiency and add value. One key enhancement is the **Education Data Dashboard** – moving from the prototype to a fully operational analytics tool. In FY2024–25, they will incorporate more data sources (like standardized test results, or student survey data) into the dashboard and refine user interfaces for different roles (teacher, principal, Board of Education officer)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). Another planned feature is deeper integration of **academic systems**: for example, linking the learning management system or assessment systems so that academic data flows into the admin records, painting a complete picture of each student (this aligns with the “data collaboration” element of Next-Gen DX)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). There is also interest in introducing **AI tools** for school administration – such as using GPT-style assistants to help draft documents or summarize meeting notes. MEXT is funding trials of generative AI for reducing admin burdens, and Akita could be a candidate to implement such tools since their data is centralized and digital (making it easier to apply AI). Another feature on the horizon is expanding the **use of digital attendance and behavior logging** so that things like incident reports or student guidance notes can be entered in one system (some of this is partially handled by C4th now, but more can be done). The system will also adapt to any new national standards – for instance, if a **national student ID** or portfolio is introduced, Akita’s cloud platform can plug into that. They specifically mention updating forms to align with an upcoming national standard (for example, linking with the high school admissions web system by using standardized student data formats)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). All these enhancements aim to continuously **improve the utility of the platform** and keep it state-of-the-art.

- **Addressing Remaining Challenges:** In the next phase, the project will tackle any outstanding issues from the pilot. For example, a few smaller municipalities in “Field 2” had not yet integrated any system (they were waiting for this project). They might require extra support in process re-engineering since they leapfrog from purely paper processes to cloud. Akita will deploy “DX support teams” to those areas to ensure a smooth transition. Another area is **full device modernization**: ensure every teacher’s device is up to spec. The pilot allowed some older PCs to connect via the interim solution; those will be decommissioned. The Prefecture is also negotiating a unified device procurement (perhaps providing funding to municipalities to refresh teacher PCs or adopting a one-teacher-one-PC across the board) to complement the system rollout. By the end of 2024, ideally all teachers will be using devices capable of meeting the security requirements without exceptions. Additionally, **refining security policies** is on the agenda: for example, once all devices are managed, they may enforce even stricter policies like required biometric login (Windows Hello) for all users to further enhance security[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). They will also review the “暫定 connection” method usage – the goal is to phase it out entirely once everyone is fully switched, thereby closing that temporary security gap by 2025[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1).

- **Continuous Training and Change Management:** Recognizing that digital transformation is ongoing, Akita plans to provide **continuous professional development** for school staff on using the new tools effectively. Future plans include creating e-learning modules within the system (like short videos on advanced tips for C4th or Teams) and annual refresh workshops. They also intend to cultivate “power users” or change agents in each school – teachers or clerks who become highly proficient and can help others. Over time, as new teachers are hired, training on the DX system will become part of standard onboarding. The cultural shift to paperless operations will be reinforced, with the aim that by 2025, the idea of faxing or printing for internal use will be virtually gone from all schools. The prefecture has set an internal deadline of **end of FY2025 to abolish fax and hanko in school admin**[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1), and they will monitor progress towards that and intervene if some schools are lagging.

- **Evaluation and Sharing Best Practices:** As the project matures, Akita will conduct thorough evaluations (as discussed in KPIs). They plan to publish a local *“project white paper”* documenting their journey, benefits, and lessons learned for stakeholders and possibly other prefectures. This will likely be done after the first full year of operation. Furthermore, Akita will continue to share its experience on national platforms – possibly in collaboration with MEXT, via conferences or working groups. The project effectively doesn’t end at just implementing the system; **it transitions into an operational phase with monitoring and continuous improvement**. Akita has committed to provide regular updates to MEXT through 2025 on how the model is scaling and any additional findings[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). This will feed into national policy refinements and could attract additional support or recognition for Akita (the prefecture might be invited to mentor others or receive awards for its pioneering work).

- **Long-Term Sustainability:** In terms of sustaining the platform, plans are in place to ensure funding and support beyond the initial project period. The Prefecture intends to consolidate the maintenance budget that was previously fragmented in different municipalities into a **single prefectural maintenance contract** (likely with NTT East/EDUCOM) after 2025, which will cover updates, support, and cloud hosting fees. Each municipality will contribute a portion based on size, but the prefecture might subsidize some costs to keep it equitable – this model is being finalized. On technical sustainability, since it’s cloud-based, keeping the software up-to-date is easier; they’ll regularly update C4th to the latest version and adopt new Microsoft 365 features as they emerge (for example, perhaps enabling new Teams functionalities or security features over time). The system is also scalable if student or teacher numbers change. Another future-proofing step is discussing **multi-tenant connectivity**: if a municipality outside Akita (or a private school) wanted to join the platform, how could that work? While not immediate, the architecture could allow, for example, a nearby prefecture to collaborate or to port this solution. This forward thinking indicates Akita is ensuring the solution remains relevant for the foreseeable future.

- **Exploring New Frontiers (AI, etc.):** As a truly future-oriented piece, Akita is paying attention to how emerging technologies can further reduce admin workload. One idea floated is integrating a **Copilot AI** to assist with tasks like drafting school letters, creating meeting minutes from voice, or answering teacher queries about how to do something in the system. Microsoft 365 A5 includes AI capabilities that could be leveraged. In presentations, Microsoft has suggested scenarios like using AI to help fill out frequently used forms or analyze patterns in the dashboard[6](https://microsoftapc-my.sharepoint.com/personal/tahaseg_microsoft_com/Documents/Microsoft%20Teams%20%e3%83%81%e3%83%a3%e3%83%83%e3%83%88%20%e3%83%95%e3%82%a1%e3%82%a4%e3%83%ab/%e3%80%90%e5%8d%b0%e5%88%b7%e7%94%a8%e3%80%91%e7%a7%8b%e7%94%b0%e7%9c%8c%e5%ae%9f%e8%a8%bc%e6%8f%90%e6%a1%88%e6%9b%b8_1020.pdf?web=1)[6](https://microsoftapc-my.sharepoint.com/personal/tahaseg_microsoft_com/Documents/Microsoft%20Teams%20%e3%83%81%e3%83%a3%e3%83%83%e3%83%88%20%e3%83%95%e3%82%a1%e3%82%a4%e3%83%ab/%e3%80%90%e5%8d%b0%e5%88%b7%e7%94%a8%e3%80%91%e7%a7%8b%e7%94%b0%e7%9c%8c%e5%ae%9f%e8%a8%bc%e6%8f%90%e6%a1%88%e6%9b%b8_1020.pdf?web=1). The prefecture may pilot some of these in a controlled manner. Another area is **student support via DX** – e.g., using the system’s data to identify at-risk students and then connecting that to intervention programs (the beginning of which is the dashboard alerts for absenteeism or health issues)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1)[3](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/00_Projects/%e3%81%82%29%e7%a7%8b%e7%94%b0%e7%9c%8c%e6%95%99%e8%82%b2%e5%a7%94%e5%93%a1%e4%bc%9a/%e4%bb%a4%e5%92%8c4%e5%b9%b4%e5%ba%a6%e6%96%87%e7%a7%91%e7%9c%81%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad/%e3%83%97%e3%83%ad%e3%82%b8%e3%82%a7%e3%82%af%e3%83%88/20240312/%ef%bc%88%e4%bf%ae%e6%ad%a3%ef%bc%8902%20%e7%ac%ac%ef%bc%92%e5%9b%9e%e5%ae%9f%e8%a8%bc%e4%ba%8b%e6%a5%ad%e6%8e%a8%e9%80%b2%e5%a7%94%e5%93%a1%e4%bc%9a%e3%80%80%e8%aa%ac%e6%98%8e%e8%b3%87%e6%96%99.pdf?web=1). This ties into future education policy focusing on each student’s well-being (e.g., the government’s drive to use data to prevent bullying or dropouts). Akita can become a leader in showing how a digitized admin system can contribute to those broader educational aims.

<!-- Copilot-Researcher-Visualization -->
```html
<style>
    :root {
        --accent: #464feb;
        --timeline-ln: linear-gradient(to bottom, transparent 0%, #b0beff 15%, #b0beff 85%, transparent 100%);
        --timeline-border: #ffffff;
        --bg-card: #f5f7fa;
        --bg-hover: #ebefff;
        --text-title: #424242;
        --text-accent: var(--accent);
        --text-sub: #424242;
        --radius: 12px;
        --border: #e0e0e0;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        --hover-shadow: 0 4px 14px rgba(39, 16, 16, 0.1);
        --font: "Segoe UI";
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --accent: #7385ff;
            --timeline-ln: linear-gradient(to bottom, transparent 0%, transparent 3%, #6264a7 30%, #6264a7 50%, transparent 97%, transparent 100%);
            --timeline-border: #424242;
            --bg-card: #1a1a1a;
            --bg-hover: #2a2a2a;
            --text-title: #ffffff;
            --text-sub: #ffffff;
            --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            --hover-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
            --border: #3d3d3d;
        }
    }

    @media (prefers-contrast: more),
    (forced-colors: active) {
        :root {
            --accent: ActiveText;
            --timeline-ln: ActiveText;
            --timeline-border: Canvas;
            --bg-card: Canvas;
            --bg-hover: Canvas;
            --text-title: CanvasText;
            --text-sub: CanvasText;
            --shadow: 0 2px 10px Canvas;
            --hover-shadow: 0 4px 14px Canvas;
            --border: ButtonBorder;
        }
    }

    .insights-container {
        display: grid;
        grid-template-columns: repeat(2,minmax(240px,1fr));
        padding: 0px 16px 0px 16px;
        gap: 16px;
        margin: 0 0;
        font-family: var(--font);
    }

    .insight-card:last-child:nth-child(odd){
        grid-column: 1 / -1;
    }

    .insight-card {
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        min-width: 220px;
        padding: 16px 20px 16px 20px;
    }

    .insight-card:hover {
        background-color: var(--bg-hover);
    }

    .insight-card h4 {
        margin: 0px 0px 8px 0px;
        font-size: 1.1rem;
        color: var(--text-accent);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .insight-card .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 1.1rem;
        color: var(--text-accent);
    }

    .insight-card p {
        font-size: 0.92rem;
        color: var(--text-sub);
        line-height: 1.5;
        margin: 0px;
    }

    .insight-card p b, .insight-card p strong {
        font-weight: 600;
    }

    .metrics-container {
        display:grid;
        grid-template-columns:repeat(2,minmax(210px,1fr));
        font-family: var(--font);
        padding: 0px 16px 0px 16px;
        gap: 16px;
    }

    .metric-card:last-child:nth-child(odd){
        grid-column:1 / -1; 
    }

    .metric-card {
        flex: 1 1 210px;
        padding: 16px;
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric-card:hover {
        background-color: var(--bg-hover);
    }

    .metric-card h4 {
        margin: 0px;
        font-size: 1rem;
        color: var(--text-title);
        font-weight: 600;
    }

    .metric-card .metric-card-value {
        margin: 0px;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-accent);
    }

    .metric-card p {
        font-size: 0.85rem;
        color: var(--text-sub);
        line-height: 1.45;
        margin: 0;
    }

    .timeline-container {
        position: relative;
        margin: 0 0 0 0;
        padding: 0px 16px 0px 56px;
        list-style: none;
        font-family: var(--font);
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: calc(-40px + 56px);
        width: 2px;
        height: 100%;
        background: var(--timeline-ln);
    }

    .timeline-container > li {
        position: relative;
        margin-bottom: 16px;
        padding: 16px 20px 16px 20px;
        border-radius: var(--radius);
        background: var(--bg-card);
        border: 1px solid var(--border);
    }

    .timeline-container > li:last-child {
        margin-bottom: 0px;
    }

    .timeline-container > li:hover {
        background-color: var(--bg-hover);
    }

    .timeline-container > li::before {
        content: "";
        position: absolute;
        top: 18px;
        left: -40px;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: var(--timeline-border) 2px solid;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0px 0px 2px 0px #00000012, 0px 4px 8px 0px #00000014;
    }

    .timeline-container > li h4 {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
    }

    .timeline-container > li * {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container > li * b, .timeline-container > li * strong {
        font-weight: 600;
    }

    @media (max-width:600px){
      .metrics-container,
      .insights-container{
        grid-template-columns:1fr;
      }
    }
</style>
<div class="insights-container">
  <div class="insight-card">
    <h4>Next Steps: Prefecture-Wide Adoption</h4>
    <p>By 2025, all remaining Akita municipalities will migrate to the cloud platform, achieving 100% coverage of the prefecture’s K-9 schools. This phased expansion will incorporate lessons from the pilot to ensure each new district’s transition is smooth, with full training and support.</p>
  </div>
  <div class="insight-card">
    <h4>Continuous Improvement</h4>
    <p>Akita will enhance the system with more features – a full analytics dashboard for student data, deeper integration of learning systems, and possibly AI assistants for administrative tasks. Ongoing updates and user feedback loops will refine workflows and keep the platform state-of-the-art.</p>
  </div>
  <div class="insight-card">
    <h4>Model for Nationwide DX</h4>
    <p>The prefecture will document outcomes and lessons to aid other regions. As national interest grows, Akita’s model may be adapted elsewhere. Akita plans to continue collaborating with MEXT, contributing to guidebooks and possibly mentoring other prefectures starting their own school DX projects.</p>
  </div>
</div>
```

In conclusion, the future of the Akita Next-Gen School Administration DX Platform Project is one of **broader deployment and deeper innovation**. The foundational work has been done; now the task is to **scale it up and maximize its impact**. By following through on these plans – completing the rollout, incrementally improving functionality, and maintaining strong alignment with educational goals – Akita aims to firmly establish a new normal for school administration that can last for decades. The project’s forward-looking approach ensures that it won’t stagnate after initial implementation; it is set up to evolve alongside technological advances and educational needs. 

If all goes as planned, by the late 2020s Akita will have a fully digital, efficient school administrative environment across every school, with teachers benefiting daily and students indirectly gaining from the enhanced support system. Moreover, Akita’s journey will likely inspire and inform many other jurisdictions in Japan, meaning the legacy of this project could be a **nationwide transformation** in how schools operate behind the scenes, ushering in a more modern era for Japanese education administration[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html).

## Project Funding and Support 

Regarding **funding**, the Akita Next-Generation School Admin DX project has been supported through a combination of national and local funding sources, structured to ensure the project’s feasibility and sustainability:

- **MEXT Subsidy (National Funding):** The initial phase of the project was largely funded by Japan’s central government as part of the *Next-Generation School Digitalization Pilot Program*. MEXT allocated a substantial budget (on the order of several hundred million yen) to each demonstration prefecture. In fact, in FY2022, MEXT secured around **¥1 billion** for launching these model projects nationwide[7](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/02_Seminar/20231201_EduTechNight#25_秋田県次世代校務/秋田県教育庁_次世代の校務デジタル化実証事業.pptx?web=1)[7](https://microsoftapc-my.sharepoint.com/personal/nahisaho_microsoft_com/Documents/02_Seminar/20231201_EduTechNight#25_秋田県次世代校務/秋田県教育庁_次世代の校務デジタル化実証事業.pptx?web=1), of which Akita received a significant portion to cover planning, system development, and initial implementation costs. This national funding covered expenses like software licensing for the pilot year, cloud infrastructure setup, and vendor development fees. Essentially, the **startup costs were heavily subsidized**, which was crucial to get all municipalities on board without financial barriers. The funding was administered through an official commission contract – MEXT “entrusted” the project to Akita, and NTT East was then contracted under that framework[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). The involvement of national funds underscores the project’s importance and reduced the direct burden on Akita’s local coffers.

- **Prefectural Budget:** Akita Prefecture also committed local budget funds to the project, especially for aspects not fully covered by the MEXT subsidy or for continuation beyond the pilot period. For instance, the prefectural Board of Education funded the project team’s operations (staff, meetings, training materials) and invested in some infrastructure (like upgrading network equipment in certain areas). The prefecture also allocated money to assist smaller municipalities in procuring new teacher devices where needed. Over the multi-year rollout, Akita will gradually assume more of the cost as it becomes a standard operational program. But even then, the **joint procurement approach yields cost savings** that make it affordable within normal budget lines: by sharing one system, economies of scale are realized. The prefecture’s strategy is to **aggregate what each municipality would have spent on their own updates** into a pool to fund the unified system. As noted, because of volume licensing (Microsoft A5, etc.) and shared infrastructure, the overall cost is much lower – roughly half – compared to separate systems, meaning each municipality’s share is lower than their status quo costs. This helps justify ongoing local funding.

- **Municipal Contributions:** While the project is centrally led, municipalities are expected to contribute to certain costs, particularly as the system moves into steady state. During the pilot, municipal costs were minimal (mostly time of their staff and maybe some PC replacements) because the pilot was funded by MEXT. Going forward, a **cost-sharing scheme** is being established. It likely factors in the number of students or teachers in each municipality to determine their share of cloud subscription and maintenance fees. For example, a large city like Akita City would pay more than a small town like Higashinaruse, but all would pay less than if they ran independent systems. Some municipalities have also secured local grants for ICT to cover initial device or network upgrades. Importantly, no municipality pays vendor costs directly – they pay into the prefecture’s program. This central billing further reduces overhead. Akita Prefecture is also exploring using some **prefectural equalization funds** to support the smallest towns, so that cost isn’t a barrier for them. In essence, municipal boards will budget a line item for “integrated school system fee” which replaces what they used to budget for things like server upkeep or software support. 

- **Digital Agency / Other Grants:** Although not explicitly stated, the project aligns with the Digital Agency’s schemes, and there may be complementary grants. For example, the Japanese government’s digital transformation initiatives sometimes provide funds to local governments that pioneer cross-jurisdictional systems. Akita’s approach of prefecture-wide service could be eligible for such support or awards. Additionally, if any aspects overlap with the Ministry of Internal Affairs (which funds local government systems), there might be subsidy opportunities (e.g., for network upgrades or security). Akita has been attentive to these funding streams; NTT East mentioned they can assist in identifying **subsidies or grants** to help with expansion[1](https://jichitai.works/article/details/2877)[1](https://jichitai.works/article/details/2877). This indicates that the project may tap into other funding programs as needed, for instance to incorporate future enhancements like AI or to extend fiber connectivity to all schools (if not already done under GIGA).

- **Sustainability of Funding:** One concern with any pilot is how to sustain it after initial funds run out. Akita has addressed this by planning to integrate the ongoing costs into the regular education budget. The prefecture has committed to continue funding the project’s core (especially the shared platform maintenance) even after the MEXT pilot period. Since the project demonstrates clear cost-benefit, it’s expected that convincing local assemblies to approve budgets will be manageable. Also, by 2025, the **prefecture will likely enter a multi-year maintenance contract** with the vendor, locking in costs and services. This will give cost predictability. The total recurring cost (cloud hosting, licenses, support) divided among stakeholders is calculated to be feasible under normal budget allocations that were previously spent on disparate systems or manual processes. Furthermore, success breeds support – seeing the positive outcomes, prefectural and municipal leaders are inclined to finance the continuation. 

- **Value for Money:** It’s worth noting that beyond direct budget, the project yields savings in time (which is hard currency in manpower). For example, if each of the ~3,000 teachers saves even an hour a week due to efficiency, that is 3,000 hours that can be considered a “return” – roughly equivalent to the work of 80+ full-time staff annually. While not a funding source, it’s a justification that the resources put in are returned in kind through productivity. 

In summary, the **project’s funding has been a mix of national seed funding and local investment**, structured to minimize financial burden on individual municipalities and ensure long-term viability. The initial heavy lifting was paid by MEXT (reflecting the project’s importance as a national model)[1](https://jichitai.works/article/details/2877)[2](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/mext_02604.html), and now Akita and its municipalities are stepping up to carry it forward with pooled resources. This cooperative funding model is itself an innovation in how educational IT is financed – moving from siloed spending to shared investment. It appears to be working well: no participant has indicated financial difficulty in continuing, and the cost savings narrative helps maintain political and community support for allocating funds. By planning for the transition from pilot to program, Akita has avoided the common pitfall of pilots that die out due to lack of continuing funds. The result is that the **project is financially sustained and poised to continue delivering value** well into the future, backed by aligned budgets at both the prefecture and municipality levels.

---

**Conclusion:** The Akita Prefecture Next-Generation School Administration DX Platform Project is a comprehensive initiative that demonstrates how aligning technology with educational policy and stakeholder needs can yield transformative results. Starting as a policy-driven pilot, it delivered a modern cloud-based school administration system that achieved its early objectives of integration, efficiency, and improved work conditions for teachers. The project meticulously addressed challenges through strong leadership, stakeholder collaboration, and technical best practices. It not only benefitted Akita by revolutionizing its school operations, but also provided a blueprint for similar transformations nationwide, showing what the future of school administration in Japan can look like. With ongoing enhancements and full deployment on the horizon, Akita’s education system is on track to become more data-informed, agile, and teacher-friendly, ultimately contributing to better educational quality for students. The journey showcases a successful case of digital transformation in the public education sector – **one that marries technology, people, and policy into a harmonious advancement of the educational environment**[1](https://jichitai.works/article/details/2877).