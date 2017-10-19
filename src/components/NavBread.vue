<template>
    <div class="nav-breadcrumb-wrap">
        <div class="container">
            <nav class="nav-breadcrumb">
                <a href="/"><slot name="first-level"></slot></slot></a>
                <slot name="second-level"></slot>
            </nav>
        </div>
    </div>
</template>