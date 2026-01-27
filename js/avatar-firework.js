document.addEventListener("DOMContentLoaded", function () {
    const avatar = document.querySelector(".home-profile .avatar img");
    if (!avatar) return;

    avatar.style.cursor = "pointer";

    // 点击烟花（大烟花 + 跳转）
    avatar.addEventListener("click", function (e) {
        const rect = avatar.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        createFirework(x, y, false);

        setTimeout(() => {
            window.location.href = "https://firework.acuherb.xyz";
        }, 600);
    });

    // ⭐ 新增：鼠标移入时的小烟花（不跳转）
    avatar.addEventListener("mouseenter", function (e) {
        const rect = avatar.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        createFirework(x, y, true);
    });

    // 通用烟花函数
    function createFirework(x, y, isHover) {
        const count = isHover ? 10 : 20; // hover 小一点
        const cls = isHover ? "avatar-firework-particle-hover" : "avatar-firework-particle";

        for (let i = 0; i < count; i++) {
            const particle = document.createElement("div");
            particle.className = cls;
            document.body.appendChild(particle);

            const angle = Math.random() * 2 * Math.PI;
            const distance = isHover ? 30 + Math.random() * 20 : 60 + Math.random() * 40;

            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;

            particle.style.left = x + "px";
            particle.style.top = y + "px";
            particle.style.setProperty("--dx", dx + "px");
            particle.style.setProperty("--dy", dy + "px");

            particle.style.animation = "avatar-firework 0.6s ease-out forwards";

            setTimeout(() => particle.remove(), 600);
        }
    }
});
