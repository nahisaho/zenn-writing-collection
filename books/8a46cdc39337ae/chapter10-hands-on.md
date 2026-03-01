---
title: "第10章: ハンズオンで学ぶ AI for Science（Python実践編）"
---

## はじめに

前章までの内容で、AI for Scienceの理論的基盤と各応用分野の最前線を概観しました。本章では、これまでに紹介した概念を**Pythonコード**で実際に体験します。

本章で取り上げるハンズオンは以下の4つです。

| ハンズオン | テーマ | 関連する章 |
| ---- | ---- | ---- |
| **1** | ASEによる分子シミュレーション | 第6章（分子動力学、力場） |
| **2** | RDKitによる分子表現と類似性検索 | 第8章（SMILES、バーチャルスクリーニング） |
| **3** | ベイズ最適化による効率的な探索 | 第4章（ベイズ最適化、能動学習） |
| **4** | PINNで微分方程式を解く | 第4章（PINN） |

:::message
本章のコードは **VS Code + Jupyter拡張機能**（Jupyter Notebook）で実行することを想定しています。ローカル環境のPython 3.9以上で動作しますが、ライブラリのインストールが必要です。
:::

## 環境構築

### VS Code + Jupyterでの準備

1. VS Codeに拡張機能「Python」と「Jupyter」をインストールします。
2. 作業フォルダでPython環境（仮想環境）を作成し、必要ライブラリをインストールします。

```bash
# venv（推奨）
python -m venv .venv
source .venv/bin/activate

python -m pip install -U pip
pip install ipykernel ase rdkit scikit-learn matplotlib torch numpy
```

3. VS Codeでノートブック（`.ipynb`）を作成または開き、本章のコードブロックをセルに貼り付けて実行します。右上のカーネル選択から `.venv` のPythonを選択してください。

:::details condaを使う場合
condaでも環境を構築できます。

```bash
# condaの場合
conda create -n ai4sci python=3.11
conda activate ai4sci
conda install -c conda-forge ase rdkit matplotlib scikit-learn numpy
pip install torch

# VS Code側でカーネルに ai4sci を選択
```
:::

## ハンズオン1: ASEによる分子シミュレーション

第6章では、分子動力学（MD）シミュレーションと機械学習力場の概念を解説しました。ここでは、Pythonの分子シミュレーションライブラリ**ASE（Atomic Simulation Environment）** を使って、実際に分子を作成し、エネルギー計算・構造最適化・MDシミュレーションを体験します。

:::message
ASEは原子スケールのシミュレーションを行うためのPythonライブラリです。さまざまな計算手法（DFT、経験的力場、機械学習力場など）を共通のインターフェイスで扱えます。本ハンズオンでは、ASEに内蔵されている**EMT（Effective Medium Theory）** 力場を使用します。EMTはFCC金属（Cu、Ag、Au、Pt等）に対して妥当な結果を与える簡易力場です。
:::

### 1.1 分子の作成とエネルギー計算

まず、銅（Cu）のバルク結晶を作成し、EMT力場でエネルギーを計算します。

```python
from ase import Atoms
from ase.build import bulk, molecule
from ase.calculators.emt import EMT

# 銅のFCC結晶を作成（2×2×2のスーパーセル）
cu_bulk = bulk('Cu', 'fcc', a=3.6, cubic=True) * (2, 2, 2)
print(f"原子数: {len(cu_bulk)}")
print(f"セルサイズ: {cu_bulk.cell.lengths()}")

# EMT力場を設定してエネルギーを計算
cu_bulk.calc = EMT()
energy = cu_bulk.get_potential_energy()
forces = cu_bulk.get_forces()

print(f"ポテンシャルエネルギー: {energy:.4f} eV")
print(f"1原子あたりのエネルギー: {energy / len(cu_bulk):.4f} eV/atom")
print(f"力の最大値: {forces.max():.6f} eV/Å")
```

実行結果の例:

```
原子数: 32
セルサイズ: [7.2 7.2 7.2]
ポテンシャルエネルギー: -0.2140 eV
1原子あたりのエネルギー: -0.0067 eV/atom
力の最大値: 0.000000 eV/Å
```

:::details 水分子を作成する場合
水分子やメタン分子など小さな分子も作成できます。ただし、EMTは金属以外には適用できないため、ここでは構造確認のみです。

```python
# 水分子の作成（構造確認のみ）
h2o = molecule('H2O')
print(f"原子: {h2o.get_chemical_symbols()}")
print(f"座標:\n{h2o.get_positions()}")
```
:::

### 1.2 構造最適化

実際の研究では、初期構造が安定状態にないことが多く、**構造最適化（ジオメトリー最適化）** でエネルギーが最小となる原子配置を求めます。

```python
from ase.build import fcc111, add_adsorbate
from ase.constraints import FixAtoms
from ase.optimize import BFGS

# Cu(111)表面スラブモデルの作成
slab = fcc111('Cu', size=(3, 3, 4), vacuum=10.0)

# 表面にCu原子を1つ吸着させる
add_adsorbate(slab, 'Cu', height=2.0, position='fcc')

# 基板の下2層を固定
constraint = FixAtoms(
    indices=[i for i in range(len(slab))
             if slab.positions[i, 2] < slab.positions[:, 2].mean()]
)
slab.set_constraint(constraint)

# EMTで構造最適化
slab.calc = EMT()
optimizer = BFGS(slab, logfile=None)
optimizer.run(fmax=0.05)

print(f"最適化後のエネルギー: {slab.get_potential_energy():.4f} eV")
print(f"最適化ステップ数: {optimizer.get_number_of_steps()}")
```

### 1.3 分子動力学シミュレーション

第6章で解説した**分子動力学（MD）** を実際に実行します。**NVTアンサンブル**（原子数N、体積V、温度T一定）のシミュレーションを行い、原子の熱振動を観察します。

```python
from ase.md.langevin import Langevin
from ase.md.velocitydistribution import MaxwellBoltzmannDistribution
from ase import units
import numpy as np

# 銅のバルク結晶を作成
atoms = bulk('Cu', 'fcc', a=3.6) * (3, 3, 3)
atoms.calc = EMT()

# ランダムな初期速度を設定（温度300 K相当）
MaxwellBoltzmannDistribution(atoms, temperature_K=300)

# Langevin動力学（NVT、温度300 K、時間刻み5 fs）
dyn = Langevin(atoms, timestep=5 * units.fs,
               temperature_K=300, friction=0.01)

# エネルギーと温度を記録
energies = []
temperatures = []

def record():
    e_kin = atoms.get_kinetic_energy() / len(atoms)
    e_pot = atoms.get_potential_energy() / len(atoms)
    temp = 2 * atoms.get_kinetic_energy() / (3 * len(atoms) * units.kB)
    energies.append((e_kin, e_pot, e_kin + e_pot))
    temperatures.append(temp)

dyn.attach(record, interval=10)

# 500ステップ実行
dyn.run(500)

print(f"最終温度: {temperatures[-1]:.1f} K")
print(f"温度の平均: {np.mean(temperatures):.1f} K")
```

```python
import matplotlib.pyplot as plt

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
steps = np.arange(len(temperatures)) * 10 * 5  # fs単位

ax1.plot(steps, temperatures)
ax1.set_xlabel("Time (fs)")
ax1.set_ylabel("Temperature (K)")
ax1.set_title("Temperature vs Time")
ax1.axhline(y=300, color='r', linestyle='--', label='Target: 300 K')
ax1.legend()

energies_arr = np.array(energies)
ax2.plot(steps, energies_arr[:, 0], label='Kinetic')
ax2.plot(steps, energies_arr[:, 1], label='Potential')
ax2.plot(steps, energies_arr[:, 2], label='Total')
ax2.set_xlabel("Time (fs)")
ax2.set_ylabel("Energy (eV/atom)")
ax2.set_title("Energy vs Time")
ax2.legend()

plt.tight_layout()
plt.show()
```

:::message
このハンズオンではASE内蔵のEMT力場を使用しましたが、実際の研究では第6章で紹介したMACEやMatterSimなどの**機械学習力場**をASEのCalculatorとして接続し、DFT級の精度でシミュレーションを行います。ASEの統一インターフェイスのおかげで、力場を切り替えるだけで同じワークフローをそのまま利用できます。
:::

## ハンズオン2: RDKitによる分子表現と類似性検索

第8章では、創薬におけるSMILES表現やフィンガープリントの役割を解説しました。ここでは、ケモインフォマティクスの標準ライブラリ**RDKit**を使って、分子の表現・記述子計算・類似性検索を体験します。

### 2.1 SMILES表記を扱う

**SMILES（Simplified Molecular-Input Line-Entry System）** は、分子構造を1行の文字列で表現する記法です。第8章で紹介したとおり、自然言語処理のテクニックをそのまま分子生成に転用できる利点があります。

```python
from rdkit import Chem
from rdkit.Chem import Descriptors

# 代表的な薬剤分子のSMILES
molecules = {
    "アスピリン": "CC(=O)Oc1ccccc1C(=O)O",
    "カフェイン": "Cn1c(=O)c2c(ncn2C)n(C)c1=O",
    "イブプロフェン": "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
    "アセトアミノフェン": "CC(=O)Nc1ccc(O)cc1",
}

# SMILESからRDKit分子オブジェクトに変換
mols = {}
for name, smiles in molecules.items():
    mol = Chem.MolFromSmiles(smiles)
    if mol is not None:
        mols[name] = mol
        mw = Descriptors.MolWt(mol)
        logp = Descriptors.MolLogP(mol)
        hbd = Descriptors.NumHDonors(mol)
        hba = Descriptors.NumHAcceptors(mol)
        print(f"{name}: MW={mw:.1f}, LogP={logp:.2f}, "
              f"HBD={hbd}, HBA={hba}")
```

実行結果:

```
アスピリン: MW=180.2, LogP=1.31, HBD=1, HBA=3
カフェイン: MW=194.2, LogP=-1.03, HBD=0, HBA=3
イブプロフェン: MW=206.3, LogP=3.07, HBD=1, HBA=1
アセトアミノフェン: MW=151.2, LogP=1.35, HBD=2, HBA=2
```

:::details リピンスキーの法則（Rule of 5）
上記で計算した4つの記述子は、**リピンスキーの法則（Rule of 5）** に直接対応しています。経口投与で吸収される薬剤の多くは次の条件を満たします。

| 記述子 | 条件 |
| ---- | ---- |
| 分子量（MW） | ≤ 500 |
| LogP | ≤ 5 |
| 水素結合ドナー（HBD） | ≤ 5 |
| 水素結合アクセプター（HBA） | ≤ 10 |
:::

### 2.2 分子フィンガープリントと類似性検索

第8章で紹介した**フィンガープリント**は、分子の部分構造をビットベクトルとして表現するもので、類似性検索やクラスタリングに広く使用されています。

```python
from rdkit.Chem import AllChem, DataStructs
import numpy as np

# Morganフィンガープリント（ECFP4相当）を計算
fps = {}
for name, mol in mols.items():
    fps[name] = AllChem.GetMorganFingerprintAsBitVect(
        mol, radius=2, nBits=2048
    )

# タニモト係数による類似性行列を計算
names = list(fps.keys())
n = len(names)
similarity_matrix = np.zeros((n, n))

for i in range(n):
    for j in range(n):
        similarity_matrix[i][j] = DataStructs.TanimotoSimilarity(
            fps[names[i]], fps[names[j]]
        )

# 類似性行列を表示
print("タニモト類似性行列:")
print(f"{'':>16}", end="")
for name in names:
    print(f"{name:>16}", end="")
print()
for i, name in enumerate(names):
    print(f"{name:>16}", end="")
    for j in range(n):
        print(f"{similarity_matrix[i][j]:>16.3f}", end="")
    print()
```

```python
# 類似性行列をヒートマップで可視化
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(similarity_matrix, cmap='YlOrRd', vmin=0, vmax=1)

ax.set_xticks(range(n))
ax.set_yticks(range(n))
ax.set_xticklabels(names, rotation=45, ha='right')
ax.set_yticklabels(names)

for i in range(n):
    for j in range(n):
        ax.text(j, i, f"{similarity_matrix[i][j]:.2f}",
                ha='center', va='center')

plt.colorbar(im, label='Tanimoto Similarity')
plt.title("分子間のタニモト類似性")
plt.tight_layout()
plt.show()
```

:::message
タニモト係数は第8章のバーチャルスクリーニングでも登場しました。値が1に近いほど分子が構造的に類似しており、一般に0.7以上で「類似した生物活性を持つ可能性が高い」と判断されます。
:::

## ハンズオン3: ベイズ最適化による効率的な探索

第4章では、**ベイズ最適化（Bayesian Optimization）** が実験科学において限られた試行で最適条件を見つけるための手法であることを解説しました。ここでは、scikit-learnのガウス過程回帰を使ってベイズ最適化を実装します。

### 3.1 問題設定: 未知の関数の最大値を探索

仮想的な実験を想定します。実験条件 $x$（温度、濃度など）を変えると、結果 $y$（収率、特性値など）が変化しますが、1回の実験には時間とコストがかかります。**できるだけ少ない実験回数で最適な条件を見つけたい**というのがベイズ最適化の目的です。

```python
import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern
import matplotlib.pyplot as plt

# 未知の目的関数（実験結果をシミュレート）
def objective(x):
    return np.sin(3 * x) * x + np.cos(5 * x) * 0.5

# 獲得関数（UCB: Upper Confidence Bound）
def ucb(x, gp, kappa=2.0):
    x = x.reshape(-1, 1)
    mu, sigma = gp.predict(x, return_std=True)
    return mu + kappa * sigma

# 探索範囲
x_range = np.linspace(0, 3, 1000).reshape(-1, 1)
y_true = objective(x_range.ravel())
```

### 3.2 ベイズ最適化の実行

```python
np.random.seed(42)

# 初期サンプル（ランダムに2点選択）
X_observed = np.array([[0.5], [2.5]])
y_observed = objective(X_observed.ravel()) + np.random.normal(0, 0.01, 2)

n_iterations = 8  # 追加実験の回数

fig, axes = plt.subplots(2, 4, figsize=(16, 8))

for i in range(n_iterations):
    # ガウス過程回帰モデルの学習
    kernel = Matern(nu=2.5, length_scale=0.5,
                    length_scale_bounds=(0.1, 10))
    gp = GaussianProcessRegressor(
        kernel=kernel, alpha=0.01, n_restarts_optimizer=5
    )
    gp.fit(X_observed, y_observed)

    # 予測（平均と標準偏差）
    y_pred, y_std = gp.predict(x_range, return_std=True)

    # 獲得関数の計算と次の実験点の決定
    acq_values = ucb(x_range, gp, kappa=2.0)
    next_x = x_range[np.argmax(acq_values)]

    # 可視化
    ax = axes[i // 4, i % 4]
    ax.plot(x_range, y_true, 'k--', alpha=0.5, label='True')
    ax.plot(x_range, y_pred, 'b-', label='GP Mean')
    ax.fill_between(x_range.ravel(),
                    y_pred - 2 * y_std,
                    y_pred + 2 * y_std,
                    alpha=0.2, color='blue')
    ax.scatter(X_observed, y_observed,
               c='red', s=50, zorder=5, label='Observed')
    ax.axvline(next_x, color='green', linestyle=':', label='Next')
    ax.set_title(f"Iteration {i + 1} (n={len(X_observed)})")
    ax.set_ylim(-2.5, 4)
    if i == 0:
        ax.legend(fontsize=7)

    # 新しい観測を追加
    next_y = objective(next_x.item()) + np.random.normal(0, 0.01)
    X_observed = np.vstack([X_observed, next_x.reshape(1, -1)])
    y_observed = np.append(y_observed, next_y)

plt.suptitle("ベイズ最適化の探索過程", fontsize=14)
plt.tight_layout()
plt.show()

best_idx = np.argmax(y_observed)
print(f"最適な条件: x = {X_observed[best_idx, 0]:.3f}")
print(f"最良の結果: y = {y_observed[best_idx]:.4f}")
print(f"真の最大値: y = {y_true.max():.4f} "
      f"(x = {x_range[np.argmax(y_true), 0]:.3f})")
```

:::message
ベイズ最適化のポイントは、**探索（Exploration）と活用（Exploitation）のバランス**です。UCB獲得関数の $\kappa$ パラメータを大きくすると未知の領域を積極的に探索し、小さくすると既知の良い領域を集中的に調べます。第4章で解説した能動学習と同様に、「どこを実験すればもっとも情報量が多いか」を定量的に判断できるのがベイズ最適化の強みです。
:::

:::details 獲得関数の種類
本ハンズオンではUCB（Upper Confidence Bound）を使用しましたが、他にも代表的な獲得関数があります。

| 獲得関数 | 式 | 特徴 |
| ---- | ---- | ---- |
| **UCB** | $\mu(x) + \kappa \sigma(x)$ | $\kappa$ で探索と活用のバランスを調整 |
| **EI** | $E[\max(f(x) - f^+, 0)]$ | 現在の最良値 $f^+$ を超える期待値 |
| **PI** | $P(f(x) > f^+)$ | 現在の最良値を超える確率 |

実務では**EI（Expected Improvement）** がもっとも広く使われています。
:::

## ハンズオン4: PINNで微分方程式を解く

第4章では、**物理情報ニューラルネットワーク（PINN: Physics-Informed Neural Network）** が物理法則を損失関数に組み込むことで、少ないデータでも物理的に整合的な予測を実現することを解説しました。ここでは、PyTorchを使ってPINNの基本的な実装を体験します。

### 4.1 問題設定: 減衰振動（常微分方程式）

以下の減衰振動の常微分方程式を解きます。

$$\frac{d^2 u}{dt^2} + 2\zeta\omega_0 \frac{du}{dt} + \omega_0^2 u = 0$$

ここで $\omega_0 = 2\pi$（固有角振動数）、$\zeta = 0.1$（減衰比）とします。初期条件は $u(0) = 1$、$\frac{du}{dt}(0) = 0$ です。

解析解は次のとおりです。

$$u(t) = e^{-\zeta \omega_0 t} \left[ \cos(\omega_d t) + \frac{\zeta \omega_0}{\omega_d} \sin(\omega_d t) \right], \quad \omega_d = \omega_0\sqrt{1 - \zeta^2}$$

### 4.2 PINNの実装

```python
import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt

# パラメータ
omega0 = 2 * np.pi
zeta = 0.1
omega_d = omega0 * np.sqrt(1 - zeta**2)

# 解析解（検証用）
def exact_solution(t):
    return np.exp(-zeta * omega0 * t) * (
        np.cos(omega_d * t)
        + (zeta * omega0 / omega_d) * np.sin(omega_d * t)
    )

# ニューラルネットワークの定義
class PINN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(1, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 1),
        )

    def forward(self, t):
        return self.net(t)
```

```python
# 訓練の実行
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = PINN().to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
scheduler = torch.optim.lr_scheduler.StepLR(
    optimizer, step_size=2000, gamma=0.5
)

losses = []
n_epochs = 5000

for epoch in range(n_epochs):
    optimizer.zero_grad()

    # コロケーション点（物理方程式を満たすべき点）
    t_col = torch.rand(200, 1, device=device,
                       requires_grad=True) * 3.0

    # ネットワークの出力
    u = model(t_col)

    # 自動微分で導関数を計算
    du_dt = torch.autograd.grad(
        u, t_col, grad_outputs=torch.ones_like(u),
        create_graph=True
    )[0]
    d2u_dt2 = torch.autograd.grad(
        du_dt, t_col, grad_outputs=torch.ones_like(du_dt),
        create_graph=True
    )[0]

    # 物理方程式の残差（ODE residual）
    residual = (d2u_dt2
                + 2 * zeta * omega0 * du_dt
                + omega0**2 * u)
    loss_pde = torch.mean(residual**2)

    # 初期条件: u(0)=1, u'(0)=0
    t_ic = torch.zeros(1, 1, device=device, requires_grad=True)
    u_ic = model(t_ic)
    du_ic = torch.autograd.grad(
        u_ic, t_ic, grad_outputs=torch.ones_like(u_ic),
        create_graph=True
    )[0]
    loss_ic = (u_ic - 1.0)**2 + du_ic**2

    # 合計損失（初期条件に重みを付ける）
    loss = loss_pde + 100 * loss_ic
    loss.backward()
    optimizer.step()
    scheduler.step()

    losses.append(loss.item())
    if (epoch + 1) % 1000 == 0:
        print(f"Epoch {epoch+1}/{n_epochs}, Loss: {loss.item():.6f}")
```

### 4.3 結果の可視化と解析解との比較

```python
# 予測
t_test = np.linspace(0, 3, 300)
t_tensor = torch.tensor(
    t_test, dtype=torch.float32, device=device
).reshape(-1, 1)

model.eval()
with torch.no_grad():
    u_pred = model(t_tensor).cpu().numpy().ravel()

u_exact = exact_solution(t_test)

# 可視化
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

ax1.plot(t_test, u_exact, 'k-', label='Exact', linewidth=2)
ax1.plot(t_test, u_pred, 'r--', label='PINN', linewidth=2)
ax1.set_xlabel("Time t")
ax1.set_ylabel("u(t)")
ax1.set_title("PINN vs Exact Solution (Damped Oscillation)")
ax1.legend()

ax2.semilogy(losses)
ax2.set_xlabel("Epoch")
ax2.set_ylabel("Loss")
ax2.set_title("Training Loss")

plt.tight_layout()
plt.show()

# 誤差の評価
error = np.abs(u_pred - u_exact)
print(f"最大絶対誤差: {error.max():.6f}")
print(f"平均絶対誤差: {error.mean():.6f}")
```

:::message
PINNのポイントは、**観測データなしでも微分方程式と初期条件のみから解を得られる**ことです。第4章で解説したように、損失関数に物理法則（PDE残差）を組み込むことで、ネットワークは物理的に整合的な解を学習します。実際の研究では、わずかな観測データと物理法則を組み合わせて、逆問題（未知のパラメータ推定）にも活用されています。
:::

:::details 発展: 逆問題への応用
このPINNの枠組みを拡張して、減衰比 $\zeta$ が未知の場合に、わずかな観測データから $\zeta$ を推定することもできます。

```python
# 逆問題のコード概要（全体構造のみ）
# zeta_param = nn.Parameter(torch.tensor(0.5))  # 初期推定値
# 残差計算時にzeta_paramを使用
# 観測データとの整合性も損失に加える
# optimizer = Adam(list(model.parameters()) + [zeta_param])
# → 訓練後、zeta_param が真の値(0.1)に収束
```

第4章のPINNの応用例で触れた「粘性係数 $\nu$ の同時推定」と同じ原理です。
:::

## まとめ

本章では、AI for Scienceの主要な概念と手法を4つのハンズオンで実践しました。

| ハンズオン | 学んだこと | 実際の研究での発展 |
| ---- | ---- | ---- |
| **1: ASE** | 分子作成、エネルギー計算、構造最適化、MD | MACE/MatterSim等の機械学習力場と接続（第6章） |
| **2: RDKit** | SMILES、分子記述子、フィンガープリント、類似性検索 | 大規模バーチャルスクリーニング（第8章） |
| **3: ベイズ最適化** | ガウス過程回帰、UCB獲得関数、逐次的探索 | 材料探索、実験計画の自動化（第4章、第7章） |
| **4: PINN** | 物理方程式の損失関数への組み込み、自動微分 | 流体力学、気象予測の物理制約（第4章、第9章） |

これらのハンズオンは入門的な内容ですが、AI for Scienceの実際の研究はこれらの延長線上にあります。たとえば、ハンズオン1のEMT力場をMACEに置き換えれば第6章で紹介したDFT級の分子シミュレーションが、ハンズオン3のベイズ最適化を高次元に拡張すれば第7章のような材料探索が実現できます。

次章では、AI for Scienceの**未来の方向性と倫理的課題**を考察し、本書を締めくくります。

:::message
**この章のポイント**
- ASEは分子シミュレーションの標準ライブラリであり、機械学習力場との接続が容易
- RDKitはSMILES表記の処理、分子記述子の計算、類似性検索に不可欠なツール
- ベイズ最適化は少ない実験回数で最適条件を発見する強力な手法
- PINNはデータなしでも物理法則から微分方程式の解を学習できる
- これらはすべてPythonで実装可能であり、研究への第一歩として活用できる
:::
